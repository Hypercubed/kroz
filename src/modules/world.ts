import { RNG } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as sound from './sound';
import * as screen from './screen';
import * as state from './state';
import * as levels from './levels';

import {
  Tile,
  BOMBABLES,
  ROCKABLES,
  VISUAL_TELEPORTABLES,
  MOBS,
  TBLOCKS,
  ITRAPS,
  COLLECTABLES,
  CWALLS,
  CSPELLS,
  KROZ,
  OSPELLS,
  ROPE_DROP,
  OWALLS,
} from '../data/tiles.ts';
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
} from '../data/constants.ts';
import { Entity, EntityType } from '../classes/entities.ts';
import { Action } from './controls';

import { Color, ColorCodes } from '../data/colors.ts';
import { clamp, delay } from '../utils/utils.ts';
import { LEVELS } from './levels';
import dedent from 'ts-dedent';
import { Timer } from './state';

const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE,
};

export async function effects() {
  for (let i = 0; i < state.level.T.length; i++) {
    state.level.T[i] = Math.max(0, state.level.T[i] - 1);
  }

  // Statue Gem Drain
  if (
    state.level.T[Timer.StatueGemDrain] > 0 &&
    RNG.getUniformInt(0, 18) === 0
  ) {
    state.stats.gems--;
    await sound.play(3800, 40);
    screen.renderStats();
  }

  // Creature generation
  const sNum = state.level.entities.reduce((acc, e) => {
    if (e.type === Tile.Slow) return acc + 1;
    return acc;
  }, 0);

  if (
    state.level.genNum > 0 &&
    sNum < 995 &&
    RNG.getUniformInt(0, 17) === 0 // 1 in 17 chance of generating a creature
  ) {
    await generateCreatures();
  }

  // TODO:

  // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST.PAS#L592
  // Move_MBlock

  // Lava Flow
  // Gravity?
  // MagitEWalls 55 <-> 66
  // Evaporate
  // TreeGrow
}

async function mobAction(e: Entity) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    state.level.map.get(e.x, e.y) !== (e.type as unknown as Tile) // Killed
  ) {
    e.kill();
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (state.level.player.x < e.x) dx = -1;
  if (state.level.player.x > e.x) dx = 1;
  if (state.level.player.y < e.y) dy = -1;
  if (state.level.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x >= XSize || y < 0 || y >= YSize) return;

  const block = state.level.map.get(x, y);

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
      state.level.map.set(e.x, e.y, Tile.Floor);
      state.level.map.set(x, y, Tile.Floor);
      e.kill();
      addScore(block);
      sound.play(800, 18);
      sound.play(400, 20);
      break;
    case Tile.Player: // Damage + Kills
      state.stats.gems--;
      state.level.map.set(e.x, e.y, Tile.Floor);
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

  if (state.level.T[Timer.FreezeTime] > 0) return;

  for (let i = 0; i < state.level.entities.length; i++) {
    const e = state.level.entities[i];
    if (t && e.type !== t) continue;

    if (e.x === -1 || e.y === -1) continue; // dead
    await mobAction(e);
  }
}

export async function playerAction() {
  // Debug Actions
  if (controls.wasActionDeactivated(Action.NextLevel))
    return await levels.nextLevel();
  if (controls.wasActionDeactivated(Action.PrevLevel))
    return await levels.prevLevel();

  if (controls.wasActionDeactivated(Action.NextLevelCheat)) {
    state.level.map.set(
      state.level.player.x + 1,
      state.level.player.y,
      Tile.Stairs,
    );
    await sound.play(2000, 40, 10);
    return;
  }

  if (controls.wasActionDeactivated(Action.FreeItems)) {
    state.stats.gems = 150;
    state.stats.whips = 99;
    state.stats.teleports = 99;
    state.stats.keys = 9;
    screen.renderStats();
    return;
  }

  if (controls.wasActionDeactivated(Action.SlowerClock)) {
    state.game.clockScale = Math.min(20, state.game.clockScale + 1);
    console.log('Clock Scale:', state.game.clockScale);
    return;
  }

  if (controls.wasActionDeactivated(Action.FasterClock)) {
    state.game.clockScale = Math.max(1, state.game.clockScale - 1);
    console.log('Clock Scale:', state.game.clockScale);
    return;
  }

  // Player Actions
  // TODO: HideFound
  if (controls.wasActionDeactivated(Action.ResetFound)) {
    state.game.foundSet = new Set();
    await screen.flashMessage('Newly found object descriptions are reset.');
    return;
  }
  if (controls.wasActionDeactivated(Action.HideFound)) {
    state.game.foundSet = true;
    await screen.flashMessage(
      'References to new objects will not be displayed.',
    );
    return;
  }

  // Game Actions
  if (controls.wasActionDeactivated(Action.Pause)) return pause();
  if (controls.wasActionDeactivated(Action.Quit)) return quit();
  if (controls.wasActionDeactivated(Action.Save)) return state.save();
  if (controls.wasActionDeactivated(Action.Restore)) return state.restore();

  // Whip can happen at any time (no return)
  if (controls.wasActionActive(Action.Whip)) {
    if (state.stats.whips < 1) {
      sound.noneSound();
    } else {
      state.stats.whips--;
      await playerWhip();
    }
  }

  if (controls.wasActionActive(Action.Teleport)) {
    if (state.stats.teleports < 1) {
      await sound.noneSound();
    } else {
      state.stats.teleports--;
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

export async function tryPlayerMove(dx: number, dy: number) {
  const x = state.level.player.x + dx;
  const y = state.level.player.y + dy;

  if (x < 0 || x > XSize || y < 0 || y > YSize) {
    await sound.staticNoise();
    addScore(Tile.Border);
    await screen.flashTileMessage(Tile.Border, true);
    return;
  }

  const block = state.level.map.get(x, y) || Tile.Floor;

  switch (block) {
    case Tile.Floor:
    case Tile.Stop:
      go(state.level.player, x, y);
      break;
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.stats.gems -= block;
      killAt(x, y);
      addScore(block);
      go(state.level.player, x, y);
      break;
    case Tile.Block:
    case Tile.ZBlock:
    case Tile.GBlock:
      addScore(block);
      await screen.flashTileMessage(Tile.Block, true);
      break;
    case Tile.Whip:
      sound.grab();
      state.stats.whips++;
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(Tile.Whip, true);
      break;
    case Tile.Stairs:
      if (state.stats.levelIndex === LEVELS.length - 1) {
        go(state.level.player, x, y);
        await endRoutine();
        return;
      }
      go(state.level.player, x, y);
      addScore(block);
      await screen.flashTileMessage(Tile.Stairs, true);
      sound.footStep();
      await levels.nextLevel();
      break;
    case Tile.Chest: {
      go(state.level.player, x, y);
      // TODO: Sound
      const whips = RNG.getUniformInt(2, 5);
      const gems = RNG.getUniformInt(2, state.game.difficulty + 2);
      state.stats.whips += whips;
      state.stats.gems += gems;
      addScore(block);
      await screen.flashMessage(
        `You found ${gems} gems and ${whips} whips inside the chest!`,
      );
      break;
    }
    case Tile.SlowTime:
      state.level.T[Timer.SpeedTime] = 0; // Reset Speed Time
      state.level.T[Timer.FreezeTime] = 0;
      state.level.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Gem:
      sound.grab();
      state.stats.gems++;
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Invisible:
      state.level.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Teleport:
      state.stats.teleports++;
      addScore(block);
      go(state.level.player, x, y);
      screen.flashTileMessage(block, true);
      break;
    case Tile.Key:
      sound.grab();
      state.stats.keys++;
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Door:
      if (state.stats.keys < 1) {
        sound.play(Math.random() * 129 + 30, 150, 100);
        await delay(100);
        await screen.flashTileMessage(block);
      } else {
        state.stats.keys--;
        addScore(block);
        await sound.openDoor();
        go(state.level.player, x, y);
        await screen.flashMessage(
          'The Door opens!  (One of your Keys is used.)',
        );
      }
      break;
    case Tile.Wall:
      sound.blockedWall();
      addScore(block);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.River:
      addScore(block);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.SpeedTime:
      state.level.T[Timer.SlowTime] = 0; // Reset Slow Time
      state.level.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Trap:
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      await playerTeleport();
      break;
    case Tile.Power:
      state.stats.whipPower++;
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Tree:
    case Tile.Forest:
      addScore(block);
      await sound.blocked();
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Bomb: {
      go(state.level.player, x, y);
      playerBomb(x, y);
      await screen.flashTileMessage(block, true);
      screen.renderBorder();
      break;
    }
    case Tile.Lava:
      state.stats.gems -= 10;
      addScore(block);
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Pit:
      go(state.level.player, x, y);
      state.stats.gems = -1; // dead
      await screen.flashTileMessage(block);
      break;
    case Tile.Tome:
      // Tome_Message;
      // Tome_Effects

      state.level.map.set(31, 6, Tile.Stairs);
      screen.drawTile(31, 6, Tile.Stairs);

      addScore(block);
      await screen.flashTileMessage(block);
      await screen.flashMessage(
        'Congratulations, Adventurer, you finally did it!!!',
      );
      break;
    case Tile.Nugget:
      sound.grab();
      go(state.level.player, x, y);
      addScore(block);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Freeze:
      state.level.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      go(state.level.player, x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Tunnel: {
      // Player starting position
      const sx = state.level.player.x;
      const sy = state.level.player.y;

      go(state.level.player, x, y);
      playerTunnel(x, y, sx, sy);
      await screen.flashTileMessage(block, true);
      break;
    }
    case Tile.Quake:
      go(state.level.player, x, y);
      await quakeTrap();
      await screen.flashTileMessage(block, true);
      break;
    case Tile.IWall:
      sound.blockedWall();
      state.level.map.set(x, y, Tile.Wall);
      screen.drawTile(x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.IBlock:
      sound.blockedWall();
      state.level.map.set(x, y, Tile.Block);
      screen.drawTile(x, y, Tile.Block);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.IDoor:
      sound.blockedWall();
      state.level.map.set(x, y, Tile.Door);
      screen.drawTile(x, y);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.Zap: {
      go(state.level.player, x, y);
      await zapTrap();
      await screen.flashTileMessage(block, true);
      break;
    }
    case Tile.Create: {
      go(state.level.player, x, y);
      await createTrap();
      addScore(block);
      await screen.flashTileMessage(block, true);
      break;
    }
    case Tile.Generator:
      addScore(block);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.MBlock:
      addScore(block);
      await screen.flashTileMessage(block, true);
      break;
    case Tile.ShowGems: {
      go(state.level.player, x, y);
      sound.grab();
      showGemsSpell();
      await screen.flashTileMessage(block, false);
      break;
    }
    case Tile.Tablet:
      go(state.level.player, x, y);
      sound.grab();
      addScore(block);
      await screen.flashTileMessage(block, true);
      await tabletMessage();
      break;
    case Tile.BlockSpell: {
      go(state.level.player, x, y);
      await blockSpell();
      await screen.flashTileMessage(block, true);
      break;
    }
    case Tile.Chance: {
      addScore(block);
      const g = RNG.getUniformInt(14, 18);
      state.stats.gems += g;
      go(state.level.player, x, y);
      await screen.flashMessage(`You found a Pouch containing ${g} Gems!`);
      break;
    }
    case Tile.Statue:
      sound.blocked();
      await screen.flashTileMessage(block);
      break;
    case Tile.WallVanish:
      go(state.level.player, x, y);
      await screen.flashTileMessage(block);
      break;
    case Tile.K:
    case Tile.R:
    case Tile.O:
    case Tile.Z:
      go(state.level.player, x, y);
      sound.grab();
      await krozBonus(block);
      break;
    case Tile.OWall1:
    case Tile.OWall2:
    case Tile.OWall3:
      sound.blockedWall();
      await screen.flashTileMessage(Tile.OWall1, true);
      break;
    case Tile.OSpell1:
    case Tile.OSpell2:
    case Tile.OSpell3: {
      go(state.level.player, x, y);
      await oSpell(block);
      await screen.flashTileMessage(block, true);
      break;
    }
    case Tile.CSpell1:
    case Tile.CSpell2:
    case Tile.CSpell3: {
      go(state.level.player, x, y);
      await cSpell(block);
      await screen.flashTileMessage(block, true);
      break;
    }
    case Tile.Rock: {
      await pushRock(x, y, dx, dy);
      break;
    }
    case Tile.EWall:
      addScore(block);
      state.stats.gems--;
      sound.staticNoise();
      await screen.flashTileMessage(Tile.EWall, true);
      break;
    case Tile.CWall1:
    case Tile.CWall2:
    case Tile.CWall3:
      go(state.level.player, x, y);
      break;
    case Tile.Trap2:
    case Tile.Trap4:
      // TBD
      go(state.level.player, x, y);
      break;
    case Tile.Trap3:
    case Tile.Trap5:
    case Tile.Trap6:
    case Tile.Trap7:
    case Tile.Trap8:
    case Tile.Trap9:
    case Tile.Trap10:
    case Tile.Trap11:
    case Tile.Trap12:
    case Tile.Trap13: {
      go(state.level.player, x, y);
      aTrap(block);
      break;
    }
    case Tile.TBlock: // 68..74 Triggers
    case Tile.TRock:
    case Tile.TGem:
    case Tile.TBlind:
    case Tile.TWhip:
    case Tile.TGold:
    case Tile.TTree:
      // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1236C1-L1254C23
      go(state.level.player, x, y);
      await triggers(x, y, block);
      break;
    case Tile.Rope:
      go(state.level.player, x, y);
      await screen.flashTileMessage(Tile.Rope, true);
      break;
    case Tile.Message: {
      await messageInTheTree();
      break;
    }
    case Tile.ShootRight:
      go(state.level.player, x, y);
      await shoot(x, y, 1);
      break;
    case Tile.ShootLeft:
      go(state.level.player, x, y);
      await shoot(x, y, -1);
      break;
    case Tile.DropRope:
    case Tile.DropRope2:
    case Tile.DropRope3:
    case Tile.DropRope4:
    case Tile.DropRope5:
      go(state.level.player, x, y);
      break;
    case Tile.Amulet:
      go(state.level.player, x, y);
      await gotAmulet();
      break;
    default:
      sound.blockedWall();
      break;
  }
}

async function killAt(x: number, y: number) {
  const block = state.level.map.get(x, y);

  state.level.map.set(x, y, Tile.Floor);

  if (block === Tile.Slow || block === Tile.Medium || block === Tile.Fast) {
    for (let i = 0; i < state.level.entities.length; i++) {
      const m = state.level.entities[i];
      if (m.x === x && m.y === y) {
        await m.kill();
      }
    }
  }
}

function go(e: Entity, x: number, y: number) {
  const px = e.x;
  const py = e.y;

  e.move(x, y);

  if (e.type === Tile.Player) {
    state.level.map.set(px, py, state.level.replacement);
    const b = state.level.map.get(x, y) as Tile;
    state.level.replacement = [
      Tile.CWall1,
      Tile.CWall2,
      Tile.CWall3,
      Tile.Rope,
    ].includes(b)
      ? b
      : Tile.Floor;
  } else {
    state.level.map.set(px, py, Tile.Floor);
  }

  state.level.map.set(x, y, e.type);
  screen.renderPlayfield();
}

async function generateCreatures() {
  let done = false;
  do {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    if (state.level.map.get(x, y) === Tile.Floor) {
      state.level.entities.push(new Entity(Tile.Slow, x, y));
      state.level.map.set(x, y, Tile.Slow);

      for (let i = 5; i < 70; i++) {
        sound.play(i * 8, 1);
      }
      await delay(50);

      done = true;
    }

    screen.renderPlayfield();
  } while (!done && RNG.getUniformInt(0, 50) !== 0);
}

async function playerWhip() {
  const PX = state.level.player.x;
  const PY = state.level.player.y;

  sound.play(70, 50 * 8, 100);
  if (PY > 0 && PX > 0) await hit(PX - 1, PY - 1, '\\');
  if (PX > 0) await hit(PX - 1, PY, '-');
  if (PY < YSize && PX > 0) await hit(PX - 1, PY + 1, '/');
  if (PY < YSize) await hit(PX, PY + 1, '❘');
  if (PY < YSize && PX < XSize) await hit(PX + 1, PY + 1, '\\');
  if (PX < XSize) await hit(PX + 1, PY, '-');
  if (PY > 0 && PX < XSize) await hit(PX + 1, PY - 1, '/');
  if (PY > 0) await hit(PX, PY - 1, '❘');

  // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
  async function hit(x: number, y: number, ch: string) {
    const thing = state.level.map.get(x, y);

    screen.drawOver(x, y, ch, ColorCodes[RNG.getUniformInt(0, 15) as Color]);

    switch (thing) {
      case Tile.Slow:
      case Tile.Medium:
      case Tile.Fast: // Kill
        killAt(x, y);
        screen.renderPlayfield();
        addScore(thing);
        break;
      case Tile.Block:
      case Tile.Forest:
      case Tile.Tree:
      case Tile.Message: {
        // Destroy?
        const w = state.stats.whipPower;
        if (6 * Math.random() < w) {
          sound.play(130, 50);
          state.level.map.set(x, y, Tile.Floor);
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
        state.level.map.set(x, y, Tile.Floor);
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
        if (30 * Math.random() < state.stats.whipPower) {
          sound.play(130, 50);
          state.level.map.set(x, y, Tile.Floor);
        } else {
          sound.play(130, 25);
          sound.play(90, 50);
        }
        break;
      case Tile.MBlock:
      case Tile.ZBlock:
      case Tile.GBlock: {
        if (6 * Math.random() < state.stats.whipPower) {
          sound.play(130, 50);
          state.level.map.set(x, y, Tile.Floor);
        } else {
          sound.play(130, 25);
          sound.play(90, 50);
        }
        break;
      }
      case Tile.Statue:
        // TODO: Sound
        if (50 * Math.random() < state.stats.whipPower) {
          // TODO: Sound
          state.level.map.set(x, y, Tile.Floor);
          addScore(thing);
          state.level.T[Timer.StatueGemDrain] = -1;
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
        state.level.map.set(x, y, Tile.Floor);
        state.level.genNum--;
        break;
      case Tile.Wall:
        break;
      default:
        break;
    }

    screen.renderStats();
    await delay(25);
  }
}

export async function flashPlayer() {
  for (let i = 0; i < 160; i++) {
    if (i % 5 === 0) {
      screen.drawTile(
        state.level.player.x,
        state.level.player.y,
        Tile.Player,
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 8),
      );
      await delay();
    }
    sound.play(i / 2, 80, 10);
  }
}

async function playerTeleport() {
  await flashPlayer();

  state.level.map.set(state.level.player.x, state.level.player.y, Tile.Floor);
  screen.drawTile(state.level.player.x, state.level.player.y);

  // Animation
  const startTime = Date.now();
  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.level.map.get(x, y);
    if (VISUAL_TELEPORTABLES.indexOf(block as Tile) > -1) {
      screen.drawTile(
        x,
        y,
        '☺',
        RNG.getUniformInt(0, 15),
        RNG.getUniformInt(0, 7),
      );
      await sound.play(20, 10, 100);
      screen.drawTile(x, y, block);
    }
    if (Date.now() - startTime > 1500) break;
  }

  // Teleport
  go(state.level.player, ...state.level.map.findRandomEmptySpace());
}

function addScore(block: Tile) {
  switch (block) {
    case Tile.Border:
      if (state.stats.score > state.stats.levelIndex)
        state.stats.score -= state.stats.levelIndex / 2;
      break;
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.stats.score += block;
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
      if (state.stats.score > 2) state.stats.score -= 2;
      break;
    case Tile.Whip:
    case Tile.SlowTime:
    case Tile.Bomb:
      state.stats.score++;
      break;
    case Tile.Stairs:
      state.stats.score += state.stats.levelIndex * 5;
      break;
    case Tile.Chest:
      state.stats.score += 10 + Math.floor(state.stats.levelIndex / 2);
      break;
    case Tile.Gem:
      state.stats.score += Math.floor(state.stats.levelIndex / 2) + 1;
      break;
    case Tile.Invisible:
      state.stats.score += 25;
      break;
    case Tile.Nugget:
      state.stats.score += 50;
      break;
    case Tile.Door:
      state.stats.score += 10;
      break;
    case Tile.Teleport:
    case Tile.Freeze:
      state.stats.score += 2;
      break;
    case Tile.SpeedTime:
    case Tile.Power:
      state.stats.score += 5;
      break;
    case Tile.Trap:
      if (state.stats.score > 5) state.stats.score -= 5;
      break;
    case Tile.Lava:
      if (state.stats.score > 100) state.stats.score += 100;
      break;
    case Tile.Tome:
      state.stats.score += 5000;
      break;
    case Tile.Tablet:
      state.stats.score += state.stats.levelIndex + 250;
      break;
    case Tile.Chance:
      state.stats.score += 100;
      break;
    case Tile.Statue:
      state.stats.score += 10;
      break;
    case Tile.Amulet:
      state.stats.score += 2500;
      break;
    case Tile.Z:
      state.stats.score += 1000;
      break;
    // case Tile.Border:
    //   if (state.stats.score > state.level.level) state.stats.score -= Math.floor(state.stats.levelIndex/ 2);
    //   break;
  }

  screen.renderStats();
}

export async function dead() {
  display.drawText(XTop / 2 - 7, 0, 'You have died.', Color.Black, Color.Red);
  await screen.flashMessage('Press any key to continue.');
  state.game.done = true;
}

async function quit() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to quit? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    state.game.done = true;
  }
}

async function pause() {
  await screen.flashMessage('Press any key to resume');
}

// See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L45
async function tabletMessage() {
  const level = state.level.level!;
  if (level.tabletMessage) {
    if (typeof level.tabletMessage === 'string') {
      await screen.flashMessage(level.tabletMessage);
    } else if (typeof level.tabletMessage === 'function') {
      await level.tabletMessage();
    }
  }
}

export async function prayer() {
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
  const gems = (state.stats.gems = isFinite(state.stats.gems)
    ? state.stats.gems
    : 150);
  const whips = (state.stats.whips = isFinite(state.stats.whips)
    ? state.stats.whips
    : 20);
  const teleports = (state.stats.teleports = isFinite(state.stats.teleports)
    ? state.stats.teleports
    : 10);
  const keys = (state.stats.keys = isFinite(state.stats.keys)
    ? state.stats.keys
    : 5);

  await screen.flashMessage('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    state.stats.gems--;
    state.stats.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    state.stats.whips--;
    state.stats.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage(
    'Your Teleport Scrolls are worth 200 points each...',
  );
  for (let i = 0; i < teleports; i++) {
    state.stats.teleports--;
    state.stats.score += 20;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    state.stats.keys--;
    state.stats.score += 1000;
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
  state.game.done = true;
}

async function shoot(x: number, y: number, dx: number) {
  x += dx;
  while (x >= 0 && x <= XSize) {
    const block = state.level.map.get(x, y);
    if (
      typeof block !== 'number' ||
      [
        Tile.Block,
        Tile.Stairs,
        Tile.Door,
        Tile.Wall,
        Tile.Lava,
        Tile.Tunnel,
        Tile.IDoor,
        Tile.Generator,
        Tile.MBlock,
        Tile.Tablet,
        Tile.ZBlock,
        Tile.Statue,
        ...OWALLS,
        Tile.GBlock,
        Tile.Rock,
        Tile.EWall,
        Tile.Amulet,
      ].includes(block)
    ) {
      // These objects stop the Spear
      break;
    }

    sound.play(x + 30, 10, 100);
    for (let b = 1; b < 6; b++) {
      screen.drawOver(x, y, '─', RNG.getUniformInt(0, 16));
      await delay(1);
    }

    if (
      ![
        Tile.Floor,
        Tile.River,
        Tile.Pit,
        Tile.Quake,
        Tile.IBlock,
        Tile.IWall,
        Tile.Stop,
        Tile.Trap2,
        Tile.Trap3,
        Tile.Trap4,
        Tile.Trap5,
        Tile.ShowGems,
        Tile.BlockSpell,
        Tile.WallVanish,
        ...CWALLS,
        ...CSPELLS,
        ...TBLOCKS,
        Tile.Rope,
      ].includes(block as number)
    ) {
      // These objects are ignored
      await sound.play(300, 10, 10);
      if (block === Tile.Slow || block === Tile.Medium || block === Tile.Fast) {
        await killAt(x, y);
      }
      state.level.map.set(x, y, Tile.Floor);
    }

    screen.drawTile(x, y);
    x += dx;
  }
  screen.renderPlayfield();
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

async function playerBomb(x: number, y: number) {
  for (let i = 70; i <= 600; i++) {
    sound.play(i * 2, 3, 10);
    if (i % 10 === 0) await delay(1);
  }

  let d = 0;
  for (; d <= 4; ++d) {
    sound.play(100 - (d * 10) / 4, 4 * 10, 100);

    const x1 = Math.max(x - d, XBot);
    const x2 = Math.min(x + d, XTop);
    const y1 = Math.max(y - d, YBot);
    const y2 = Math.min(y + d, YTop);

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        screen.drawOver(x, y, '█', Color.LightRed);
        const block = (state.level.map.get(x, y) as number) ?? Tile.Floor;
        if (BOMBABLES.includes(block as number)) {
          if (block >= 1 && block <= 4) {
            addScore(block);
            killAt(x, y);
          }
        }
      }
    }
    await sound.play(30, 10, 10);
    await delay(20);
  }
  await delay(100);

  d = 4;
  const x1 = Math.max(x - d, XBot);
  const x2 = Math.min(x + d, XTop);
  const y1 = Math.max(y - d, YBot);
  const y2 = Math.min(y + d, YTop);

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      const block = (state.level.map.get(x, y) as number) ?? Tile.Floor;
      if (BOMBABLES.includes(block as number)) {
        state.level.map.set(x, y, Tile.Floor);
      }
    }
  }
  screen.renderPlayfield();
}

async function playerTunnel(x: number, y: number, sx: number, sy: number) {
  await delay(350);
  await sound.footStep();
  await delay(500);
  state.level.map.set(x, y, Tile.Tunnel);
  screen.drawTile(x, y, Tile.Tunnel);

  // Find a random tunnel
  let tx = x;
  let ty = y;
  for (let i = 0; i < 10000; i++) {
    const a = RNG.getUniformInt(0, XSize);
    const b = RNG.getUniformInt(0, YSize);
    const t = state.level.map.get(a, b) ?? Tile.Floor;
    if (t === Tile.Tunnel && (a !== tx || b !== ty)) {
      tx = a;
      ty = b;
      go(state.level.player, tx, ty);
      break;
    }
  }

  state.level.map.set(x, y, Tile.Tunnel);
  screen.drawTile(x, y, Tile.Tunnel);

  // Find a random empty space near exit
  let ex = sx;
  let ey = sy;
  for (let i = 0; i < 100; i++) {
    const a = RNG.getUniformInt(-1, 1);
    const b = RNG.getUniformInt(-1, 1);
    if (tx + a < 0 || tx + a > XSize || ty + b < 0 || ty + b > YSize) continue;
    const e = state.level.map.get(tx + a, ty + b) ?? Tile.Floor;
    if (
      [
        0, 32, 33, 37, 39, 55, 56, 57, 67, 224, 225, 226, 227, 227, 229, 230,
        231,
      ].includes(e as Tile)
    ) {
      ex = tx + a;
      ey = ty + b;
      break;
    }
  }
  go(state.level.player, ex, ey);

  state.level.map.set(tx, ty, Tile.Tunnel);
  screen.drawTile(tx, ty, Tile.Tunnel);
}

async function quakeTrap() {
  for (let i = 0; i < 2500; i++) {
    sound.play(RNG.getUniformInt(0, i), 5, 100);
    if (i % 25 === 0) await delay();
  }

  await delay(50);
  for (let i = 0; i < 50; i++) {
    do {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = state.level.map.get(x, y);
      if (ROCKABLES.includes(block as number)) {
        state.level.map.set(x, y, Tile.Rock);
        screen.drawTile(x, y, Tile.Rock);
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
}

async function zapTrap() {
  let t = 0;
  let k = 0;
  while (t < 500 && k < 40) {
    t++;
    const n = RNG.getUniformInt(0, state.level.entities.length);
    const e = state.level.entities[n];
    if (!e || e.x === -1 || e.y === -1) continue; // dead
    await killAt(e.x, e.y);
    screen.renderPlayfield();
    await delay(20);
    k++;
  }

  state.stats.score += Math.floor(k / 3 + 2);
  screen.renderPlayfield();
  screen.renderStats();
}

async function createTrap() {
  const SNum = state.level.entities.reduce((acc, e) => {
    if (e.type === Tile.Slow) return acc + 1;
    return acc;
  }, 0);
  if (SNum < 945) {
    for (let i = 0; i < 45; i++) {
      await generateCreatures();
    }
  }
}

async function showGemsSpell() {
  for (let i = 0; i < state.game.difficulty * 2 + 5; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = state.level.map.get(x, y);
      if (block === Tile.Floor) {
        sound.play(RNG.getUniformInt(110, 1310), 7, 100);
        done = true;
        state.level.map.set(x, y, Tile.Gem);
        screen.drawTile(x, y, Tile.Gem);
        await delay(99);
      }
    } while (!done && Math.random() > 0.01);
  }
  screen.renderPlayfield();
}

async function blockSpell() {
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.level.map.get(x, y) === Tile.ZBlock) {
        sound.play(200, 60, 100);
        for (let i = 20; i > 0; i--) {
          screen.drawTile(x, y, Tile.Block, RNG.getUniformInt(0, 15));
          await delay(3);
        }
        state.level.map.set(x, y, Tile.Floor);
        screen.drawTile(x, y, Tile.Floor);
      } else if (state.level.map.get(x, y) === Tile.BlockSpell) {
        state.level.map.set(x, y, Tile.Floor);
        screen.drawTile(x, y, Tile.Floor);
      }
    }
  }
}

async function krozBonus(block: Tile) {
  if (block === Tile.K && state.level.bonus === 0) state.level.bonus = 1;
  if (block === Tile.R && state.level.bonus === 1) state.level.bonus = 2;
  if (block === Tile.O && state.level.bonus === 2) state.level.bonus = 3;
  if (block === Tile.Z && state.level.bonus === 3) {
    await sound.bonusSound();
    addScore(block);
    await screen.flashTileMessage(block);
  }
}

async function oSpell(block: Tile) {
  let s = Tile.OWall1;
  if (block === Tile.OSpell2) s = Tile.OWall2;
  if (block === Tile.OSpell3) s = Tile.OWall3;

  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      const block = state.level.map.get(x, y);
      if (block === s) {
        for (let i = 60; i > 0; i--) {
          screen.drawTile(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        state.level.map.set(x, y, Tile.Floor);
        screen.drawTile(x, y, Tile.Floor);
      }
    }
  }
}

async function cSpell(block: Tile) {
  const s = block - Tile.CSpell1 + Tile.CWall1;

  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      const block = state.level.map.get(x, y);
      if (block === s) {
        for (let i = 60; i > 0; i--) {
          screen.drawTile(
            x,
            y,
            RNG.getItem(['▄', '▌', '▐', '▀']) as string,
            RNG.getUniformInt(0, 14),
          );
          sound.play(i * 40, 5, 10);
          if (i % 5 === 0) await delay(1);
        }
        state.level.map.set(x, y, Tile.Wall);
        screen.drawTile(x, y, Tile.Wall);
      }
    }
  }
}

async function pushRock(x: number, y: number, dx: number, dy: number) {
  let nogo = false;

  const rx = state.level.player.x + dx * 2;
  const ry = state.level.player.y + dy * 2;
  if (rx < 0 || rx > XSize || ry < 0 || ry > YSize) nogo = true;

  if (!nogo) {
    const rb = state.level.map.get(rx, ry); // TODO: other cases

    async function moveRock() {
      nogo = false;
      await sound.moveRock();
      state.level.map.set(rx, ry, Tile.Rock);
      go(state.level.player, x, y);
      screen.renderPlayfield();
      await screen.flashTileMessage(Tile.Rock, true);
    }

    // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
    if (
      [
        Tile.Floor,
        Tile.Stop,
        Tile.ShowGems,
        Tile.BlockSpell,
        Tile.WallVanish,
        ...CWALLS,
        ...CSPELLS,
        Tile.Trap5,
        ...TBLOCKS,
        ...ITRAPS,
      ].includes(rb as number)
    ) {
      await moveRock();
    } else if (
      [
        ...COLLECTABLES,
        Tile.Chest,
        Tile.SlowTime,
        Tile.Invisible,
        Tile.Key,
        Tile.Trap,
        Tile.Power,
        Tile.Bomb,
        Tile.Freeze,
        Tile.Nugget,
        Tile.Zap,
        Tile.Create,
        Tile.Tablet,
        Tile.Chance,
        ...KROZ,
        ...OSPELLS,
        ...ROPE_DROP,
        Tile.ShootRight,
        Tile.ShootLeft,
      ].includes(rb as number)
    ) {
      await moveRock();
      await sound.grab();
    } else if (MOBS.includes(rb as number)) {
      await moveRock();
      addScore(rb as Tile);
      await sound.play(600, 20);
    } else if (rb === Tile.EWall) {
      await moveRock();
      state.level.map.set(rx, ry, Tile.Floor);
      sound.play(90, 10, 10);
      await screen.flashMessage('The Boulder is vaporized!'); // TODO: show once
    } else if ([Tile.Stairs, Tile.Pit].includes(rb as number)) {
      nogo = false;
      await sound.moveRock();
      go(state.level.player, x, y);
      screen.renderPlayfield();
      screen.drawTile(rx, ry, Tile.Rock);
      for (let i = 130; i > 5; i--) {
        await sound.play(i * 8, 16, 100);
      }
      screen.renderPlayfield();
      await screen.flashTileMessage(Tile.Rock, true);
    }
  }

  if (nogo) {
    await sound.blocked();
  }
}

function aTrap(block: Tile) {
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      const a = state.level.map.get(x, y);
      if (block === a) {
        state.level.map.set(x, y, Tile.Floor);
        screen.drawTile(x, y, Tile.Floor);
      }
    }
  }
}

async function messageInTheTree() {
  for (let i = 20; i < 8000; i++) {
    sound.play(i, 1, 100);
  }
  await delay(100);
  await screen.flashMessage(
    'You notice a secret message carved into the old tree...',
  );
  await screen.flashMessage('"Goodness of Heart Overcomes Adversity."');
  await screen.flashMessage(
    'Reveal that you found this message to Scott Miller...',
  );
  await screen.flashMessage(
    'And receive a "MASTER KROZ CERTIFICATE" to hang on your wall!!',
  );
  await screen.flashMessage('Only the first 100 players to report this...');
  await screen.flashMessage(
    'Will be awarded the certificate.  Congratulations!',
  );
}

const B = [
  Tile.Floor,
  Tile.Stop,
  ...ITRAPS,
  Tile.ShowGems,
  Tile.WallVanish,
  ...TBLOCKS,
];
async function triggers(x: number, y: number, block: Tile) {
  let t = Tile.Floor;
  switch (block) {
    case Tile.TBlock:
      t = Tile.Block;
      break;
    case Tile.TRock:
      t = Tile.Rock;
      break;
    case Tile.TGem:
      t = Tile.Gem;
      break;
    case Tile.TBlind:
      t = Tile.Invisible;
      break;
    case Tile.TWhip:
      t = Tile.Whip;
      break;
    case Tile.TGold:
      t = Tile.Nugget;
      break;
    case Tile.TTree:
      t = Tile.Tree;
      break;
  }

  for (let b = 0; b < 10; b++) {
    await triggerTrap(false, RNG.getUniformInt(0, 7), RNG.getUniformInt(0, 7));
    await sound.play((b + 25) * b * 2, 20, 10);
  }

  return triggerTrap(true);

  async function triggerTrap(place: boolean, fg?: number, bg?: number) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const b = state.level.map.get(x + dx, y + dy);
        if (B.includes(b as Tile)) {
          screen.drawTile(x + dx, y + dy, t, fg, bg);
          if (place) state.level.map.set(x + dx, y + dy, t);
        }
        await delay(5);
      }
    }
  }
}
