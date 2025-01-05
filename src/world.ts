import { RNG } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as sound from './sound';
import * as screen from './screen';
import * as state from './state';
import * as levels from './levels';

import {
  TileChar,
  TileColor,
  Tile,
  BOMBABLES,
  ROCKABLES,
  VISUAL_TELEPORTABLES,
  TileMessage,
} from './tiles';
import {
  HEIGHT,
  TIME_SCALE,
  TITLE,
  WIDTH,
  XBot,
  XSize,
  XTop,
  YBot,
  YSize,
  YTop,
} from './constants';
import { Entity, EntityType } from './entities';
import { Action } from './controls';

import { Color, ColorCodes } from './colors';
import { mod } from 'rot-js/lib/util';
import { clamp, delay } from './utils';
import { LEVELS } from './levels';
import dedent from 'ts-dedent';
import { Timer } from './state';

const GenFactor = 17; // 1 in 17 chance of generating a creature

const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE,
};

export async function loadLevel() {
  levels.loadLevel();
  state.storeLevelStartState();
  renderPlayfield();
  screen.renderStats();
  await screen.flashMessage('Press any key to begin this level.');
}

export async function nextLevel() {
  controls.flushAll();
  state.state.levelIndex = mod(state.state.levelIndex + 1, LEVELS.length);
  await loadLevel();
}

async function prevLevel() {
  controls.flushAll();
  state.state.levelIndex = mod(state.state.levelIndex - 1, LEVELS.length);
  await loadLevel();
}

export async function effects() {
  state.state.T = state.state.T.map((t) => (t > 0 ? t - 1 : 0));

  // Statue Gem Drain
  if (
    state.state.T[Timer.StatueGemDrain] > 0 &&
    RNG.getUniformInt(0, 18) === 0
  ) {
    state.state.gems--;
    await sound.play(3800, 40);
    screen.renderStats();
  }

  // Creature generation
  const sNum = state.state.entities.reduce((acc, e) => {
    if (e.type === Tile.Slow) return acc + 1;
    return acc;
  }, 0);

  if (
    state.state.genNum > 0 &&
    sNum < 995 &&
    RNG.getUniformInt(0, GenFactor) === 0
  ) {
    await generateCreatures();
  }

  // TODO:
  // Lava Flow
  // Gravity?
  // MagitEWalls 55 <-> 66
  // Evaporate
  // TreeGrow
}

async function generateCreatures() {
  let done = false;
  do {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    if (state.state.PF[x][y] === Tile.Floor) {
      state.state.entities.push(new Entity(Tile.Slow, x, y));
      state.state.PF[x][y] = Tile.Slow;

      for (let i = 5; i < 70; i++) {
        sound.play(i * 8, 1);
      }
      await delay(50);

      done = true;
    }

    renderPlayfield();
  } while (!done && RNG.getUniformInt(0, 50) !== 0);
}

async function mobAction(e: Entity) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    state.state.PF[e.x][e.y] !== (e.type as unknown as Tile) // Killed
  ) {
    e.kill();
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (state.state.player.x < e.x) dx = -1;
  if (state.state.player.x > e.x) dx = 1;
  if (state.state.player.y < e.y) dy = -1;
  if (state.state.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x >= XSize || y < 0 || y >= YSize) return;

  const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;

  switch (block) {
    case Tile.Floor: // Breaks
    case Tile.TBlock:
    case Tile.TRock:
    case Tile.TGem:
    case Tile.TBlind:
    case Tile.TGold:
    case Tile.TWhip:
    case Tile.TTree:
      go(e, x, y);
      break;
    case Tile.Block: // Breaks + Kills
    case Tile.MBlock:
    case Tile.ZBlock:
    case Tile.GBlock:
      state.state.PF[e.x][e.y] = Tile.Floor;
      state.state.PF[x][y] = Tile.Floor;
      e.kill();
      addScore(block);
      sound.play(800, 18);
      sound.play(400, 20);
      break;
    case Tile.Player: // Damage + Kills
      state.state.gems--;
      state.state.PF[e.x][e.y] = Tile.Floor;
      e.kill();
      addScore(block);
      break;
    case Tile.Whip: // Grabs
    case Tile.Chest:
    case Tile.SlowTime:
    case Tile.Gem:
    case Tile.Invisible:
    case Tile.Teleport:
    case Tile.Key:
    case Tile.SpeedTime:
    case Tile.Trap:
    case Tile.Power:
    case Tile.Freeze:
    case Tile.Nugget:
    case Tile.K:
    case Tile.R:
    case Tile.O:
    case Tile.Z:
    case Tile.ShootRight:
    case Tile.ShootLeft:
      sound.grab();
      go(e, x, y);
      break;
    default: // Blocked
      go(e, e.x, e.y);
      break;
  }
}

export async function entitiesAction(t?: EntityType) {
  if (t === Tile.Player) {
    // await playerAction(); // Player acts every tick
    return;
  }

  if (state.state.T[Timer.FreezeTime] > 0) return;

  for (let i = 0; i < state.state.entities.length; i++) {
    const e = state.state.entities[i];
    if (t && e.type !== t) continue;

    if (e.x === -1 || e.y === -1) continue; // dead
    await mobAction(e);
  }
}

async function save() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to SAVE? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    state.saveLevelStartState();
  }
}

async function restore() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage(
      'Are you sure you want to RESTORE? (Y/N)',
    );
  }

  if (answer.toLowerCase() === 'y') {
    // Don't need deep copy now, but might later
    state.restoreLevelStartState();
    loadLevel();
  }
}

export async function playerAction() {
  // Debug Actions
  if (controls.wasActionDeactivated(Action.NextLevel)) return await nextLevel();

  if (controls.wasActionDeactivated(Action.PrevLevel)) return await prevLevel();

  if (controls.wasActionDeactivated(Action.FreeItems)) {
    state.state.gems = Infinity;
    state.state.whips = Infinity;
    state.state.teleports = Infinity;
    state.state.keys = Infinity;
    screen.renderStats();
    return;
  }

  // Player Actions
  // TODO: HideFound
  if (controls.wasActionDeactivated(Action.ResetFound)) {
    state.state.foundSet = new Set();
    return;
  }

  // Game Actions
  if (controls.wasActionDeactivated(Action.Pause)) return pause();
  if (controls.wasActionDeactivated(Action.Quit)) return quit();
  if (controls.wasActionDeactivated(Action.Save)) return save();
  if (controls.wasActionDeactivated(Action.Restore)) return restore();

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (state.state.whips < 1) {
      sound.noneSound();
    } else {
      state.state.whips--;
      await playerWhip();
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (state.state.teleports < 1) {
      await sound.noneSound();
    } else {
      state.state.teleports--;
      await playerTeleport();
    }
  }

  // Player Movement
  let dx = 0;
  let dy = 0;

  if (controls.wasActionActive(Action.North)) dy--;
  if (controls.wasActionActive(Action.South)) dy++;
  if (controls.wasActionActive(Action.West)) dx--;
  if (controls.wasActionActive(Action.East)) dx++;

  if (controls.wasActionActive(Action.Southeast)) {
    dx++;
    dy++;
  }
  if (controls.wasActionActive(Action.Southwest)) {
    dx--;
    dy++;
  }
  if (controls.wasActionActive(Action.Northeast)) {
    dx++;
    dy--;
  }
  if (controls.wasActionActive(Action.Northwest)) {
    dx--;
    dy--;
  }

  dx = clamp(dx, -1, 1);
  dy = clamp(dy, -1, 1);

  if (dx !== 0 || dy !== 0) {
    await tryPlayerMove(dx, dy);
  }
}

async function tryPlayerMove(dx: number, dy: number) {
  const x = state.state.player.x + dx;
  const y = state.state.player.y + dy;

  if (x < 0 || x > XSize || y < 0 || y > YSize) return;
  // flashTileMessage(16,25,'An Electrified Wall blocks your way.');

  const block = state.state.PF?.[x]?.[y] || Tile.Floor;

  switch (block) {
    case Tile.Floor:
    case Tile.Stop:
      go(state.state.player, x, y);
      break;
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.state.gems -= block;
      killAt(x, y);
      addScore(block);
      go(state.state.player, x, y);
      break;
    case Tile.Block:
    case Tile.ZBlock:
    case Tile.GBlock:
      addScore(block);
      await flashTileMessage(Tile.Block, true);
      break;
    case Tile.Whip:
      sound.grab();
      state.state.whips++;
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(Tile.Whip, true);
      break;
    case Tile.Stairs:
      if (state.state.levelIndex === LEVELS.length - 1) {
        go(state.state.player, x, y);
        await endRoutine();
        return;
      }
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(Tile.Stairs, true);
      await nextLevel();
      break;
    case Tile.Chest: {
      go(state.state.player, x, y);
      // TODO: Sound
      const whips = RNG.getUniformInt(2, 5);
      const gems = RNG.getUniformInt(2, state.state.difficulty + 2);
      state.state.whips += whips;
      state.state.gems += gems;
      addScore(block);
      await screen.flashMessage(
        `You found ${gems} gems and ${whips} whips inside the chest!`,
      );
      break;
    }
    case Tile.SlowTime:
      state.state.T[Timer.SpeedTime] = 0; // Reset Speed Time
      state.state.T[Timer.FreezeTime] = 0;
      state.state.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Gem:
      sound.grab();
      state.state.gems++;
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Invisible:
      state.state.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Teleport:
      state.state.teleports++;
      addScore(block);
      go(state.state.player, x, y);
      flashTileMessage(block, true);
      break;
    case Tile.Key:
      sound.grab();
      state.state.keys++;
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Door:
      if (state.state.keys < 1) {
        sound.play(Math.random() * 129 + 30, 150, 100);
        await delay(100);
        await flashTileMessage(block);
      } else {
        state.state.keys--;
        addScore(block);
        await sound.openDoor();
        go(state.state.player, x, y);
        await screen.flashMessage(
          'The Door opens!  (One of your Keys is used.)',
        );
      }
      break;
    case Tile.Wall:
      sound.blockedWall();
      addScore(block);
      await flashTileMessage(block, true);
      break;
    case Tile.River:
      addScore(block);
      await flashTileMessage(block, true);
      break;
    case Tile.SpeedTime:
      state.state.T[Timer.SlowTime] = 0; // Reset Slow Time
      state.state.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Trap:
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      await playerTeleport();
      break;
    case Tile.Power:
      state.state.whipPower++;
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Tree:
    case Tile.Forest:
      addScore(block);
      await sound.blocked();
      await flashTileMessage(block, true);
      break;
    case Tile.Bomb: {
      go(state.state.player, x, y);

      const d = 4;
      const x1 = Math.max(state.state.player.x - d, XBot);
      const x2 = Math.min(state.state.player.x + d, XTop);
      const y1 = Math.max(state.state.player.y - d, YBot);
      const y2 = Math.min(state.state.player.y + d, YTop);

      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          const block = (state.state.PF?.[x]?.[y] as number) ?? Tile.Floor;
          if (BOMBABLES.includes(block as number)) {
            if (block >= 1 && block <= 4) {
              addScore(block);
              await killAt(x, y);
            }
            state.state.PF[x][y] = Tile.Floor;
          }
        }
      }

      await flashTileMessage(block, true);
      break;
    }
    case Tile.Lava:
      state.state.gems -= 10;
      addScore(block);
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Pit:
      go(state.state.player, x, y);
      state.state.gems = -1; // dead
      await flashTileMessage(block);
      break;
    case Tile.Tome:
      // Tome_Message;
      // Tome_Effects

      state.state.PF[31][6] = Tile.Stairs;
      drawTile(31, 6, Tile.Stairs);

      addScore(block);
      await flashTileMessage(block);
      await screen.flashMessage(
        'Congratulations, Adventurer, you finally did it!!!',
      );
      break;
    case Tile.Nugget:
      sound.grab();
      go(state.state.player, x, y);
      addScore(block);
      await flashTileMessage(block, true);
      break;
    case Tile.Freeze:
      state.state.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Tunnel: {
      // Player starting position
      const sx = state.state.player.x;
      const sy = state.state.player.y;

      // Move into the tunnel
      go(state.state.player, x, y);
      await delay(350);
      await sound.footStep();
      await delay(500);
      state.state.PF[x][y] = Tile.Tunnel;
      drawTile(x, y, Tile.Tunnel);

      // Find a random tunnel
      let tx = x;
      let ty = y;
      for (let i = 0; i < 10000; i++) {
        const a = RNG.getUniformInt(0, XSize);
        const b = RNG.getUniformInt(0, YSize);
        const t = state.state.PF?.[a]?.[b] ?? Tile.Floor;
        if (t === Tile.Tunnel && (a !== tx || b !== ty)) {
          tx = a;
          ty = b;
          go(state.state.player, tx, ty);
          break;
        }
      }

      state.state.PF[x][y] = Tile.Tunnel;
      drawTile(x, y, Tile.Tunnel);

      // Find a random empty space near exit
      let ex = sx;
      let ey = sy;
      for (let i = 0; i < 100; i++) {
        const a = RNG.getUniformInt(-1, 1);
        const b = RNG.getUniformInt(-1, 1);
        if (tx + a < 0 || tx + a > XSize || ty + b < 0 || ty + b > YSize)
          continue;
        const e = state.state.PF?.[tx + a]?.[ty + b] ?? Tile.Floor;
        if (
          [
            0, 32, 33, 37, 39, 55, 56, 57, 67, 224, 225, 226, 227, 227, 229,
            230, 231,
          ].includes(e as Tile)
        ) {
          ex = tx + a;
          ey = ty + b;
          break;
        }
      }
      go(state.state.player, ex, ey);

      state.state.PF[tx][ty] = Tile.Tunnel;
      drawTile(tx, ty, Tile.Tunnel);

      await flashTileMessage(block, true);
      break;
    }
    case Tile.Quake:
      go(state.state.player, x, y);

      for (let i = 0; i < 2500; i++) {
        sound.play(RNG.getUniformInt(0, i), 5, 100);
        if (i % 25 === 0) await delay();
      }

      await delay(50);
      for (let i = 0; i < 50; i++) {
        do {
          const x = RNG.getUniformInt(0, XSize);
          const y = RNG.getUniformInt(0, YSize);
          const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;
          if (ROCKABLES.includes(block as number)) {
            state.state.PF[x][y] = Tile.Rock;
            drawTile(x, y, Tile.Rock);
            break;
          }
        } while (Math.random() > 0.01);
        for (let i = 0; i < 50; i++) {
          sound.play(RNG.getUniformInt(0, 200), 50, 100);
        }
        await delay(50);
      }

      for (let i = 2500; i > 50; i--) {
        sound.play(RNG.getUniformInt(0, i), 5, 100);
        if (i % 25 === 0) await delay();
      }

      await flashTileMessage(block, true);
      break;
    case Tile.IWall:
      sound.blockedWall();
      state.state.PF[x][y] = Tile.Wall;
      drawTile(x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.IBlock:
      sound.blockedWall();
      state.state.PF[x][y] = Tile.Block;
      drawTile(x, y, Tile.Block);
      await flashTileMessage(block, true);
      break;
    case Tile.IDoor:
      sound.blockedWall();
      state.state.PF[x][y] = Tile.Door;
      drawTile(x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Zap: {
      go(state.state.player, x, y);

      let t = 0;
      let k = 0;
      while (t < 500 && k < 40) {
        t++;
        const n = RNG.getUniformInt(0, state.state.entities.length);
        const e = state.state.entities[n];
        if (!e || e.x === -1 || e.y === -1) continue; // dead
        await killAt(e.x, e.y);
        await delay(20);
        k++;
      }

      state.state.score += Math.floor(k / 3 + 2);
      renderPlayfield();
      screen.renderStats();

      await flashTileMessage(block, true);
      break;
    }
    case Tile.Create: {
      go(state.state.player, x, y);
      const SNum = state.state.entities.reduce((acc, e) => {
        if (e.type === Tile.Slow) return acc + 1;
        return acc;
      }, 0);
      if (SNum < 945) {
        for (let i = 0; i < 45; i++) {
          await generateCreatures();
        }
      }

      addScore(block);
      await flashTileMessage(block, true);
      break;
    }
    case Tile.Generator:
      addScore(block);
      // go(state.state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.MBlock:
      addScore(block);
      await flashTileMessage(block, true);
      break;
    case Tile.ShowGems:
      go(state.state.player, x, y);
      TileChar[Tile.Gem] = '♦';
      renderPlayfield();
      // TODO: sound?
      await flashTileMessage(block);
      break;
    case Tile.Tablet:
      go(state.state.player, x, y);
      sound.grab();
      addScore(block);
      await flashTileMessage(block, true);
      await tabletMessage();
      break;
    case Tile.BlockSpell: {
      go(state.state.player, x, y);
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.state.PF[x][y] === Tile.ZBlock) {
            sound.play(200, 60, 100);
            for (let i = 20; i > 0; i--) {
              drawTile(x, y, Tile.Block, RNG.getUniformInt(0, 15));
              await delay(3);
            }
            state.state.PF[x][y] = Tile.Floor;
            drawTile(x, y, Tile.Floor);
          } else if (state.state.PF[x][y] === Tile.BlockSpell) {
            state.state.PF[x][y] = Tile.Floor;
            drawTile(x, y, Tile.Floor);
          }
        }
      }
      await flashTileMessage(block, true);
      break;
    }
    case Tile.Chance: {
      addScore(block);
      const g = RNG.getUniformInt(14, 18);
      state.state.gems += g;
      go(state.state.player, x, y);
      await screen.flashMessage(`You found a Pouch containing ${g} Gems!`);
      break;
    }
    case Tile.Statue:
      sound.blocked();
      await flashTileMessage(block);
      break;
    case Tile.WallVanish:
      go(state.state.player, x, y);
      await flashTileMessage(block);
      break;
    case Tile.K:
      go(state.state.player, x, y);
      sound.grab();
      if (state.state.bonus === 0) state.state.bonus = 1;
      break;
    case Tile.R:
      go(state.state.player, x, y);
      sound.grab();
      if (state.state.bonus === 1) state.state.bonus = 2;
      break;
    case Tile.O:
      go(state.state.player, x, y);
      sound.grab();
      if (state.state.bonus === 2) state.state.bonus = 3;
      break;
    case Tile.Z:
      go(state.state.player, x, y);
      sound.grab();
      if (state.state.bonus === 3) {
        for (let i = 10; i < 45; i++) {
          for (let j = 1; j < 13; j++) {
            await sound.play(i * i * j, j + 1, 100);
          }
        }
        addScore(block);
        flashTileMessage(block);
      }
      break;
    case Tile.OWall1:
    case Tile.OWall2:
    case Tile.OWall3:
      sound.blockedWall();
      await flashTileMessage(Tile.OWall1, true);
      break;
    case Tile.OSpell1:
    case Tile.OSpell2:
    case Tile.OSpell3: {
      go(state.state.player, x, y);

      let s = Tile.OWall1;
      if (block === Tile.OSpell2) s = Tile.OWall2;
      if (block === Tile.OSpell3) s = Tile.OWall3;

      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;
          if (block === s) {
            for (let i = 60; i > 0; i--) {
              drawTile(
                x,
                y,
                RNG.getItem(['▄', '▌', '▐', '▀']) as string,
                RNG.getUniformInt(0, 14),
              );
              sound.play(i * 40, 5, 10);
              if (i % 5 === 0) await delay(1);
            }
            state.state.PF[x][y] = Tile.Floor;
            drawTile(x, y, Tile.Floor);
          }
        }
      }

      await flashTileMessage(block, true);
      break;
    }
    case Tile.CSpell1:
    case Tile.CSpell2:
    case Tile.CSpell3: {
      go(state.state.player, x, y);

      const s = block - Tile.CSpell1 + Tile.CWall1;

      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;
          if (block === s) {
            for (let i = 60; i > 0; i--) {
              drawTile(
                x,
                y,
                RNG.getItem(['▄', '▌', '▐', '▀']) as string,
                RNG.getUniformInt(0, 14),
              );
              sound.play(i * 40, 5, 10);
              if (i % 5 === 0) await delay(1);
            }
            state.state.PF[x][y] = Tile.Wall;
            drawTile(x, y, Tile.Wall);
          }
        }
      }

      await flashTileMessage(block, true);
      break;
    }
    case Tile.Rock: {
      let nogo = false;

      const rx = state.state.player.x + dx * 2;
      const ry = state.state.player.y + dy * 2;
      if (rx < 0 || rx > XSize || ry < 0 || ry > YSize) nogo = true;

      if (!nogo) {
        const rb = state.state.PF?.[rx]?.[ry] ?? Tile.Floor; // TODO: other cases

        // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
        switch (rb) {
          case Tile.Floor: // TODO: Other floor-ish tiles
            nogo = false;
            await sound.moveRock();
            state.state.PF[rx][ry] = Tile.Rock;
            go(state.state.player, x, y);
            renderPlayfield();
            await flashTileMessage(Tile.Rock, true);
            break;
          // TODO: Mobs (kills + score)
          // TODO: EWall
          case Tile.Stairs:
          case Tile.Pit:
            nogo = false;
            await sound.moveRock();
            go(state.state.player, x, y);
            renderPlayfield();
            drawTile(rx, ry, Tile.Rock);
            for (let i = 130; i > 5; i--) {
              await sound.play(i * 8, 16, 100);
            }
            renderPlayfield();
            await flashTileMessage(Tile.Rock, true);
            break;
          default:
            nogo = false;
            break;
        }
      }

      if (nogo) {
        await sound.blocked();
      }

      break;
    }
    case Tile.EWall:
      addScore(block);
      state.state.gems--;
      sound.noise();
      await flashTileMessage(Tile.EWall, true);
      break;
    case Tile.CWall1:
    case Tile.CWall2:
    case Tile.CWall3:
      go(state.state.player, x, y);
      break;
    case Tile.Trap2:
    case Tile.Trap4:
      // TBD
      go(state.state.player, x, y);
      break;
    case Tile.Trap5:
    case Tile.Trap6:
    case Tile.Trap7:
    case Tile.Trap8:
    case Tile.Trap9:
    case Tile.Trap10:
    case Tile.Trap11:
    case Tile.Trap12:
    case Tile.Trap13: {
      go(state.state.player, x, y);
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          const a = state.state.PF?.[x]?.[y] ?? Tile.Floor;
          if (block === a) {
            state.state.PF[x][y] = Tile.Floor;
            drawTile(x, y, Tile.Floor);
          }
        }
      }
      break;
    }
    case Tile.Trap3: {
      // Clears out the Trap3
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;
          if (block === Tile.Trap3) {
            state.state.PF[x][y] = Tile.Floor;
            drawTile(x, y, Tile.Floor);
          }
        }
      }
      break;
    }
    case Tile.TBlind:
    case Tile.TBlock:
    case Tile.TGem:
    case Tile.TGold:
    case Tile.TRock:
    case Tile.TTree:
    case Tile.TWhip:
      go(state.state.player, x, y);
      break;
    case Tile.Rope:
      go(state.state.player, x, y);
      await flashTileMessage(Tile.Rope, true);
      break;
    case Tile.Message:
      // Secret_Message;
      break;
    case Tile.ShootRight:
      // Shoot_Right;
      break;
    case Tile.ShootLeft:
      // Shoot_Left;
      break;
    case Tile.DropRope:
    case Tile.DropRope2:
    case Tile.DropRope3:
    case Tile.DropRope4:
    case Tile.DropRope5:
      go(state.state.player, x, y);
      break;
    case Tile.Amulet:
      go(state.state.player, x, y);
      await gotAmulet();
      break;
    default:
      sound.blockedWall();
      break;
  }
}

async function flashTileMessage(msg: number, once: boolean = false) {
  if (once) {
    if (state.state.foundSet.has(msg)) return '';
    state.state.foundSet.add(msg);
  }

  const str = TileMessage[msg];
  if (!str) return '';

  return await screen.flashMessage(str);
}

async function killAt(x: number, y: number) {
  const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;

  state.state.PF[x][y] = Tile.Floor;

  if (block === Tile.Slow || block === Tile.Medium || block === Tile.Fast) {
    for (let i = 0; i < state.state.entities.length; i++) {
      const m = state.state.entities[i];
      if (m.x === x && m.y === y) {
        await m.kill();
      }
    }
  }

  renderPlayfield();
}

let replacement = Tile.Floor;

function go(e: Entity, x: number, y: number) {
  const px = e.x;
  const py = e.y;

  e.move(x, y);

  if (e.type === Tile.Player) {
    state.state.PF[px][py] = replacement;
    const b = state.state.PF[x][y] as Tile;
    replacement = [Tile.CWall1, Tile.CWall2, Tile.CWall3, Tile.Rope].includes(b)
      ? b
      : Tile.Floor;
  } else {
    state.state.PF[px][py] = Tile.Floor;
  }

  state.state.PF[x][y] = e.type;
  renderPlayfield();
}

async function playerWhip() {
  const PX = state.state.player.x;
  const PY = state.state.player.y;

  sound.play(70, 50 * 8, 100);
  if (PY > 0 && PX > 0) await hit(PX - 1, PY - 1, '\\');
  if (PX > 0) await hit(PX - 1, PY, '-');
  if (PY < YSize && PX > 0) await hit(PX - 1, PY + 1, '/');
  if (PY < YSize) await hit(PX, PY + 1, '❘');
  if (PY < YSize && PX < XSize) await hit(PX + 1, PY + 1, '\\');
  if (PX < XSize) await hit(PX + 1, PY, '-');
  if (PY > 0 && PX < XSize) await hit(PX + 1, PY - 1, '/');
  if (PY > 0) await hit(PX, PY - 1, '❘');
}

export async function flashPlayer() {
  for (let i = 0; i < 160; i++) {
    if (i % 5 === 0) {
      drawTile(
        state.state.player.x,
        state.state.player.y,
        Tile.Player,
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 8),
      );
      await delay();
    }
    sound.play(i / 2, 80, 10);
  }

  // for (let i = 0; i < 250; i++) {
  //   drawTile(state.state.player.x, state.state.player.y, Tile.Player, RNG.getUniformInt(0, 15), RNG.getUniformInt(0, 15));
  //   await sound.play(20, 1, 100);
  // }
}

async function playerTeleport() {
  await flashPlayer();

  state.state.PF[state.state.player.x][state.state.player.y] = Tile.Floor;
  drawTile(state.state.player.x, state.state.player.y);

  // Animation
  const startTime = Date.now();
  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;
    if (VISUAL_TELEPORTABLES.indexOf(block as Tile) > -1) {
      drawTile(x, y, '☺', RNG.getUniformInt(0, 15), RNG.getUniformInt(0, 7));
      await sound.play(20, 10, 100);
      drawTile(x, y, block);
    }
    if (Date.now() - startTime > 1500) break;
  }

  // Teleport
  while (true) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;
    if (block === Tile.Floor) {
      state.state.PF[x][y] = Tile.Player;
      state.state.player.x = x;
      state.state.player.y = y;
      renderPlayfield();
      break;
    }
  }
}

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
async function hit(x: number, y: number, ch: string) {
  const thing = state.state.PF?.[x]?.[y] ?? Tile.Floor;

  drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(0, 15) as Color]);

  switch (thing) {
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast: // Kill
      killAt(x, y);
      addScore(thing);
      break;
    case Tile.Block:
    case Tile.Forest:
    case Tile.Tree:
    case Tile.Message: {
      // Destroy?
      const w = state.state.whipPower;
      if (6 * Math.random() < w) {
        sound.play(130, 50);
        state.state.PF[x][y] = Tile.Floor;
      } else {
        sound.play(130, 25);
        sound.play(90, 50);
      }
      break;
    }
    case Tile.Invisible:
    case Tile.SpeedTime:
    case Tile.Trap:
    case Tile.Power:
    case Tile.K:
    case Tile.R:
    case Tile.O:
    case Tile.Z: // Break
      state.state.PF[x][y] = Tile.Floor;
      sound.play(400, 50);
      // TODO: Generator special case
      break;
    case Tile.Quake:
    case Tile.IBlock:
    case Tile.IWall:
    case Tile.IDoor:
    case Tile.Trap2:
    case Tile.Trap3:
    case Tile.Trap4:
    case Tile.ShowGems:
    case Tile.BlockSpell:
    case Tile.Trap5:
    case Tile.Trap6:
    case Tile.Trap7:
    case Tile.Trap8:
    case Tile.Trap9:
    case Tile.Trap10:
    case Tile.Trap11:
    case Tile.Trap12:
    case Tile.Trap13:
    case Tile.Stop:
      // No break, no effect
      break;
    case Tile.Rock:
      if (30 * Math.random() < state.state.whipPower) {
        sound.play(130, 50);
        state.state.PF[x][y] = Tile.Floor;
      } else {
        sound.play(130, 25);
        sound.play(90, 50);
      }
      break;
    case Tile.MBlock:
    case Tile.ZBlock:
    case Tile.GBlock: {
      if (6 * Math.random() < state.state.whipPower) {
        sound.play(130, 50);
        state.state.PF[x][y] = Tile.Floor;
      } else {
        sound.play(130, 25);
        sound.play(90, 50);
      }
      break;
    }
    case Tile.Statue:
      // TODO: Sound
      if (50 * Math.random() < state.state.whipPower) {
        // TODO: Sound
        state.state.PF[x][y] = Tile.Floor;
        addScore(thing);
        state.state.T[Timer.StatueGemDrain] = -1;
        await screen.flashMessage(
          `You've destroyed the Statue!  Your Gems are now safe.`,
        );
      } else {
        sound.play(130, 25);
        sound.play(90, 50);
      }
      break;
    case Tile.Generator:
      // TODO: Sound
      addScore(thing);
      state.state.PF[x][y] = Tile.Floor;
      state.state.genNum--;
      break;
    case Tile.Wall:
      break;
    default:
      break;
  }

  screen.renderStats();
  await delay(25);
}

export function renderPlayfield() {
  for (let x = 0; x < state.state.PF.length; x++) {
    for (let y = 0; y < state.state.PF[x].length; y++) {
      // Skip entities, will be rendered later
      const b = state.state.PF[x][y] || Tile.Floor;
      if (b === Tile.Player) continue;
      if (b === Tile.Slow || b === Tile.Medium || b === Tile.Fast) continue;

      drawTile(x, y, state.state.PF[x][y] || Tile.Floor);
    }
  }

  const floorColor = TileColor[Tile.Floor][1]!;

  for (let i = 0; i < state.state.entities.length; i++) {
    const e = state.state.entities[i];
    if (e.x === -1 || e.y === -1) continue; // dead
    drawTile(e.x, e.y, e.getChar(), TileColor[e.type][0]!, floorColor);
  }

  drawTile(
    state.state.player.x,
    state.state.player.y,
    state.state.player.getChar(),
    TileColor[state.state.player.type][0]!,
    floorColor,
  );
}

export function drawTile(
  x: number,
  y: number,
  block: Tile | string = Tile.Floor,
  fg?: Color | string,
  bg?: Color | string,
) {
  let ch: string;

  if (typeof block === 'number') {
    ch = TileChar[block] ?? block ?? TileChar[Tile.Floor];
    fg =
      fg ??
      TileColor[block as unknown as Tile]?.[0] ??
      TileColor[Tile.Floor][0]!;
    bg =
      bg ??
      TileColor[block as unknown as Tile]?.[1] ??
      TileColor[Tile.Floor][1]!;
  } else if (
    (block >= 'a' && block <= 'z') ||
    ['!', '·', '∙', '∩'].includes(block)
  ) {
    ch = block.toUpperCase();
    fg = fg ?? Color.HighIntensityWhite;
    bg = bg ?? Color.Brown;
  } else {
    ch = block as string;
  }

  switch (block) {
    case Tile.Stairs:
      fg = typeof fg === 'number' && !state.state.paused ? fg | 16 : fg; // add blink
      break;
  }

  display.draw(x + XBot, y + YBot, ch, fg!, bg!);
}

function drawOver(x: number, y: number, ch: string, fg: string | Color) {
  const block = state.state.PF?.[x]?.[y] ?? Tile.Floor;

  let bg: number;
  if ((block >= 'a' && block <= 'z') || block === '!') {
    bg = Color.Brown;
  } else {
    bg = TileColor[block as unknown as Tile]?.[1] ?? TileColor[Tile.Floor][1]!;
  }

  display.draw(x + XBot, y + YBot, ch, fg, bg);
}

function addScore(block: Tile) {
  switch (block) {
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.state.score += block;
      break;
    case Tile.Block:
    case Tile.ZBlock:
    case Tile.GBlock:
    case Tile.Wall:
    case Tile.River:
    case Tile.Tree:
    case Tile.Forest:
    case Tile.MBlock:
    case Tile.OWall1:
    case Tile.OWall2:
    case Tile.OWall3:
    case Tile.EWall:
      if (state.state.score > 2) state.state.score -= 2;
      break;
    case Tile.Whip:
    case Tile.SlowTime:
    case Tile.Bomb:
      state.state.score++;
      break;
    case Tile.Stairs:
      state.state.score += state.state.levelIndex * 5;
      break;
    case Tile.Chest:
      state.state.score += 10 + Math.floor(state.state.levelIndex / 2);
      break;
    case Tile.Gem:
      state.state.score += Math.floor(state.state.levelIndex / 2) + 1;
      break;
    case Tile.Invisible:
      state.state.score += 25;
      break;
    case Tile.Nugget:
      state.state.score += 50;
      break;
    case Tile.Door:
      state.state.score += 10;
      break;
    case Tile.Teleport:
    case Tile.Freeze:
      state.state.score += 2;
      break;
    case Tile.SpeedTime:
    case Tile.Power:
      state.state.score += 5;
      break;
    case Tile.Trap:
      if (state.state.score > 5) state.state.score -= 5;
      break;
    case Tile.Lava:
      if (state.state.score > 100) state.state.score += 100;
      break;
    case Tile.Tome:
      state.state.score += 5000;
      break;
    case Tile.Tablet:
      state.state.score += state.state.levelIndex + 250;
      break;
    case Tile.Chance:
      state.state.score += 100;
      break;
    case Tile.Statue:
      state.state.score += 10;
      break;
    case Tile.Amulet:
      state.state.score += 2500;
      break;
    case Tile.Z:
      state.state.score += 1000;
      break;
    // case Tile.Border:
    //   if (state.state.score > state.state.level) state.state.score -= Math.floor(state.state.levelIndex/ 2);
    //   break;
  }

  screen.renderStats();
}

export async function dead() {
  display.drawText(XTop / 2 - 7, 0, 'You have died.', Color.Black, Color.Red);
  await screen.flashMessage('Press any key to continue.');
  state.state.done = true;
}

async function quit() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to quit? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    state.state.done = true;
  }
}

async function pause() {
  await screen.flashMessage('Press any key to resume');
}

// See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L45
async function tabletMessage() {
  switch (state.state.level!.id) {
    case 'Debug':
    case 'Lost26': {
      await screen.flashMessage('No one has ever made it to the 26th level!');
      await screen.flashMessage(
        'You have shown exceptional skills to reach this far...',
      );
      await screen.flashMessage('Therefore I grant you the power to see...');

      // Show IWalls
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.state.PF[x][y] === Tile.IWall) {
            await sound.play(x * y, 10, 10);
            state.state.PF[x][y] = Tile.OWall3;
            drawTile(x, y, Tile.OWall3);
          }
        }
      }

      await screen.flashMessage('Behold...your path awaits...');

      break;
    }
    case 'Lost30':
      await prayer();
      await screen.flashMessage(
        '"If goodness is in my heart, that which flows shall..."',
      );

      // Replace River with Nugget
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.state.PF[x][y] === Tile.River) {
            await sound.play(x * y, 50, 10);
            state.state.PF[x][y] = Tile.Nugget;
            drawTile(x, y, Tile.Nugget);
          }
        }
      }

      await screen.flashMessage('"...Turn to Gold!"');

      break;
    case 'Lost42':
      await prayer();
      await screen.flashMessage(
        '"Barriers of water, like barriers in life, can always be..."',
      );

      // Clears River with Block
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.state.PF[x][y] === Tile.River) {
            await sound.play(x * y, 50, 10);
            state.state.PF[x][y] = Tile.Block;
            drawTile(x, y, Tile.Block);
          }
        }
      }

      await screen.flashMessage('"...Overcome!"');

      break;
    case 'Lost61':
      await screen.flashMessage(
        'Walls that block your progress shall be removed...',
      );
      state.state.PF[state.state.player.x][state.state.player.y] = Tile.OSpell1;
      tryPlayerMove(0, 0);
      break;
    case 'Lost64': {
      await prayer();
      await screen.flashMessage(
        '"Tnarg yna rerutnevda ohw sevivrus siht raf..."',
      );
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.state.PF[x][y] === Tile.CWall1) {
            await sound.play(x * y, 50, 10);
            state.state.PF[x][y] = Tile.Nugget;
            // ArtColor??
            drawTile(x, y, Tile.Nugget);
          }
        }
      }
      await screen.flashMessage('"...Dlog!"');
      break;
    }
    case 'Lost75': {
      await prayer();
      await screen.flashMessage('"Ttocs Rellim Setalutargnoc Uoy!"');
      await screen.flashMessage(
        'Your palms sweat as the words echo through the chamber...',
      );
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.state.PF[x][y] === Tile.Pit) {
            await sound.play(x * y, 50, 10);
            state.state.PF[x][y] = Tile.Rock;
            drawTile(x, y, Tile.Rock);
          }
        }
      }
      await screen.flashMessage('...Your eyes widen with anticipation!');
      break;
    }
    default:
      break;
  }
}

async function prayer() {
  await screen.flashMessage(
    'On the Ancient Tablet is a short Mantra, a prayer...',
  );
  await screen.flashMessage(
    'You take a deep breath and speak the words aloud...',
  );
}

export async function renderTitle() {
  display.clear(Color.Blue);

  display.drawText(
    2,
    5,
    dedent`
    In the mystical Kingdom of Kroz, where ASCII characters come to life and
    danger lurks around every corner, a new chapter unfolds. You, a brave
    archaeologist, have heard whispers of the legendary Magical Amulet of Kroz,
    an artifact of immense power long thought lost to time.

    Will you be the one to uncover the secrets of the forsaken caverns? Can you
    retrieve the Magical Amulet and restore glory to the Kingdom of Kroz? The
    adventure awaits, brave explorer!

  `,
    Color.LightCyan,
    Color.Blue,
  );

  display.drawText(
    9,
    16,
    `Use the cursor keys to move yourself (%c{${ColorCodes[Color.Yellow]}}☻%c{${ColorCodes[Color.LightGreen]}}) through the caverns.`,
    Color.LightGreen,
    Color.Blue,
  );

  display.writeCenter(
    17,
    `Use your whip (press W) to destroy all nearby creatures.`,
    Color.LightGreen,
    Color.Blue,
  );

  display.writeCenter(
    HEIGHT - 1,
    'Press any key to begin your decent into Kroz.',
    Color.HighIntensityWhite,
    Color.Blue,
  );

  const x = WIDTH / 2 - TITLE.length / 2;

  await controls.repeatUntilKeyPressed(async () => {
    display.drawText(x, 3, TITLE, RNG.getUniformInt(0, 16), Color.Red);
    await delay(500);
  });
}

export async function endRoutine() {
  await sound.footStep();
  await delay(200);
  await sound.footStep();
  await delay(200);
  await sound.footStep();

  await screen.flashMessage('Oh no, something strange is happening!');
  await screen.flashMessage('You are magically transported from Kroz!');

  // Check for infinite items
  const gems = (state.state.gems = isFinite(state.state.gems)
    ? state.state.gems
    : 150);
  const whips = (state.state.whips = isFinite(state.state.whips)
    ? state.state.whips
    : 20);
  const teleports = (state.state.teleports = isFinite(state.state.teleports)
    ? state.state.teleports
    : 10);
  const keys = (state.state.keys = isFinite(state.state.keys)
    ? state.state.keys
    : 5);

  await screen.flashMessage('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    state.state.gems--;
    state.state.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    state.state.whips--;
    state.state.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage(
    'Your Teleport Scrolls are worth 200 points each...',
  );
  for (let i = 0; i < teleports; i++) {
    state.state.teleports--;
    state.state.score += 20;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    state.state.keys--;
    state.state.score += 1000;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  display.clear(Color.Blue);

  display.drawText(25, 3, 'ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ', Color.White, Color.Blue);

  display.drawText(
    10,
    5,
    dedent`
        Carefully, you place the ancient tome on your table and open
        to the first page.  You read the book intently, quickly
        deciphering the archaic writings.

        You learn of Lord Dullwit, the once powerful and benevolent
        ruler of Kroz, who sought wealth and education for his people.
        The magnificent KINGDOM OF KROZ was once a great empire, until
        it was overthrown by an evil Wizard, who wanted the riches of
        Kroz for himself.

        Using magic beyond understanding, the Wizard trapped Lord
        Dullwit and his people in a chamber so deep in Kroz that any
        hope of escape was fruitless.

        The Wizard then built hundreds of deadly chambers that would
        stop anyone from ever rescuing the good people of Kroz.
        Once again your thoughts becomes clear:  To venture into the
        depths once more and set free the people of Kroz.
       `,
    Color.White,
    Color.Blue,
  );

  await screen.flashMessage('Press any key, Adventurer.');
  state.state.done = true;
}

async function gotAmulet() {
  await sound.grab();
  for (let x = 45; x >= 11; x--) {
    for (let y = 13; y >= 1; y--) {
      await sound.play(x * x * y, y + 1, 100);
    }
  }
  addScore(Tile.Amulet);
  await screen.flashMessage(
    'You have found the Amulet of Yendor -- 25,000 points!',
  );
  await screen.flashMessage(
    'It seems that Kroz and Rogue share the same underground!)',
  );
  await screen.flashMessage(
    'Your quest for the treasure of Kroz must still continue...',
  );
}
