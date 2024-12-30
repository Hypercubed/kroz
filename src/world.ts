import { RNG } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as sound from './sound';
import * as screen from './screen';

import { TileChar, TileColor, MapLookup, Tile } from './tiles';
import { DEBUG, FLOOR_CHAR, XBot, XSize, XTop, YBot, YSize, YTop } from './constants';
import { Entity, EntityType } from './entities';
import { Action } from './controls';

import {
  LEVELS,
} from './levels';
import { Color, ColorCodes } from './colors';

// TODO: Spells enum
// TODO: Spells duration

const SPELL_DURATION = 1000;

export enum Timer {
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
}

export const state = getDefaultState();

function getDefaultState() {
  return {
    player: new Entity(Tile.Player, 0, 0),
    entities: [] as Entity[],
  
    PF: [] as (Tile | string)[][],
    foundSet: new Set(),
  
    T: [
      0,
      0,
      0,
      0,
      Timer.SlowTime, // 4 - Slow Time
      Timer.Invisible, // 5 - Invisible
      Timer.SpeedTime, // 6 - Speed Time
      Timer.FreezeTime, // 7 - Freeze Time
      0,
      0
    ], // Timers
  
    level: DEBUG ? 0 : 1,
    score: 0,
    gems: 20,
    whips: 0,
    teleports: 0,
    keys: 0,
    whipPower: 2,
  
    actionActive: false,
    paused: false,
    done: false
  };
}

export function resetState() {
  Object.assign(state, getDefaultState());
}

export async function loadLevel() {
  const level = LEVELS[state.level];
  readLevel(level);

  state.T = state.T.map(() => 0); // Reset timers
  renderPlayfield();
  screen.renderStats();
  await screen.flash('Press any key to begin this level.');
}

export async function nextLevel() {
  state.level++;
  state.level %= LEVELS.length;
  loadLevel();
}

async function prevLevel() {
  state.level--;
  state.level %= LEVELS.length;
  loadLevel();
}

async function enemyAction(e: Entity) {
  if (
    e.x === -1 ||
    e.y === -1 ||
    state.PF[e.x][e.y] !== (e.type as unknown as Tile) // Killed
  ) {
    e.kill();
    return;
  } // dead

  let dx = 0;
  let dy = 0;
  if (state.player.x < e.x) dx = -1;
  if (state.player.x > e.x) dx = 1;
  if (state.player.y < e.y) dy = -1;
  if (state.player.y > e.y) dy = 1;

  const x = e.x + dx;
  const y = e.y + dy;

  if (x < 0 || x >= XSize || y < 0 || y >= YSize) return;

  const block = state.PF?.[x]?.[y] ?? Tile.Floor;

  switch (block) {
    case Tile.Block:
    case Tile.MBlock:
    case Tile.ZBlock:
    case Tile.GBlock: // Kills
      state.PF[e.x][e.y] = Tile.Floor;
      state.PF[x][y] = Tile.Floor;
      e.kill();
      state.score += block;
      sound.play(800, 18);
      sound.play(400, 20);
      break;
    case Tile.Floor: // Eats
    case Tile.TBlock:
    case Tile.TRock:
    case Tile.TGem:
    case Tile.TBlind:
    case Tile.TGold:
    case Tile.TWhip:
    case Tile.TTree:
      go(e, x, y);
      break;
    case Tile.Player:
      state.gems--;
      state.PF[e.x][e.y] = Tile.Floor;
      e.kill();
      break;
    default: // Blocked
      go(e, e.x, e.y);
      break;
  }
}

export async function action(t?: EntityType) {
  if (t === Tile.Player) {
    await playerAction();
  }

  for (let i = 0; i < state.entities.length; i++) {
    const e = state.entities[i];
    if (t && e.type !== t) continue;

    if (e.x === -1 || e.y === -1) continue; // dead
    await enemyAction(e);
  }
}

async function playerAction() {
  const actionState = controls.pollActions();

  if (actionState[Action.FreeItems]) await doPlayerAction(Action.FreeItems);
  if (actionState[Action.NextLevel]) await doPlayerAction(Action.NextLevel);
  if (actionState[Action.PrevLevel]) await doPlayerAction(Action.PrevLevel);

  if (actionState[Action.North] && actionState[Action.West]) return await doPlayerAction(Action.Northwest);
  if (actionState[Action.North] && actionState[Action.East]) return await doPlayerAction(Action.Northeast);
  if (actionState[Action.South] && actionState[Action.West]) return await doPlayerAction(Action.Southwest);
  if (actionState[Action.South] && actionState[Action.East]) return await doPlayerAction(Action.Southeast);

  if (actionState[Action.North]) return await doPlayerAction(Action.North);
  if (actionState[Action.South]) return await doPlayerAction(Action.South);
  if (actionState[Action.West]) return await doPlayerAction(Action.West);
  if (actionState[Action.East]) return await doPlayerAction(Action.East);
  if (actionState[Action.Southeast]) return await doPlayerAction(Action.Southeast);
  if (actionState[Action.Southwest]) return await doPlayerAction(Action.Southwest);
  if (actionState[Action.Northeast]) return await doPlayerAction(Action.Northeast);
  if (actionState[Action.Northwest]) return await doPlayerAction(Action.Northwest);

  if (actionState[Action.Whip]) return await doPlayerAction(Action.Whip);
  if (actionState[Action.Teleport]) return await doPlayerAction(Action.Teleport);
}

async function doPlayerAction(action: Action) {
  if (state.actionActive) return;
  state.actionActive = true;

  let _playerMove = false;

  switch (action) {
    case Action.FreeItems:
      state.gems = Infinity;
      state.whips = Infinity;
      state.teleports = Infinity;
      state.keys = Infinity;
      screen.renderStats();
      break;
    case Action.NextLevel:
      await nextLevel();
      break;
    case Action.PrevLevel:
      await prevLevel();
      break;
    case Action.North:
      await playerMove(0, -1);
      _playerMove = true;
      break;
    case Action.South:
      await playerMove(0, +1);
      _playerMove = true;
      break;
    case Action.West:
      await playerMove(-1, 0);
      _playerMove = true;
      break;
    case Action.East:
      await playerMove(+1, 0);
      _playerMove = true;
      break;
    case Action.Southeast:
      await playerMove(+1, +1);
      _playerMove = true;
      break;
    case Action.Southwest:
      await playerMove(-1, +1);
      _playerMove = true;
      break;
    case Action.Northeast:
      await playerMove(+1, -1);
      _playerMove = true;
      break;
    case Action.Northwest:
      await playerMove(-1, -1);
      _playerMove = true;
      break;
    case Action.Whip:
      if (state.whips < 1) {
        sound.noneSound();
      } else {
        state.whips--;
        await playerWhip();
      }
      _playerMove = true;
      break;
    case Action.Teleport:
      if (state.teleports < 1) {
        await sound.noneSound();
      } else {
        state.teleports--;
        await playerTeleport();
      }
      _playerMove = true;
      break;
  }
  state.actionActive = false;
  return _playerMove;
}

function readLevel(level: string) {
  state.entities = [];

  const lines = level.split('\n').filter((line) => line.length > 0);
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const char = line.charAt(x) ?? FLOOR_CHAR;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const block = (MapLookup as any)[char];

      state.PF[x] = state.PF[x] || [];
      state.PF[x][y] = block ?? char;

      switch (block) {
        case Tile.Player:
          state.player.x = x;
          state.player.y = y;
          break;
        case Tile.Slow:
        case Tile.Medium:
        case Tile.Fast:
          state.entities.push(new Entity(block, x, y));
          break;
      }
    }
  }

  // Randomize
  TileColor[Tile.Floor][0] = Color.White;
  TileColor[Tile.Floor][1] = Color.Black;
  TileColor[Tile.Gem] = [RNG.getUniformInt(1, 16), null];
}

async function playerMove(dx: number, dy: number) {
  const x = state.player.x + dx;
  const y = state.player.y + dy;

  if (x < 0 || x > XSize || y < 0 || y > YSize) return;
  // Flash(16,25,'An Electrified Wall blocks your way.');

  const block = state.PF?.[x]?.[y] || Tile.Floor;

  switch (block) {
    case Tile.Floor:
    case Tile.Stop:
      go(state.player, x, y);
      break;
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      killAt(x, y);
      go(state.player, x, y);
      break;
    case Tile.Block:
      addScore(block);
      await screen.flash(Tile.Block, true);
      break;
    case Tile.Whip:
      sound.grab();
      state.whips++;
      addScore(block);
      go(state.player, x, y);
      await screen.flash(Tile.Whip, true);
      break;
    case Tile.Stairs:
      if (state.level === LEVELS.length - 1) {
        go(state.player, x, y);
        await endRoutine();
        return;
      }
      addScore(block);
      go(state.player, x, y);
      await screen.flash(Tile.Stairs, true);
      nextLevel();
      break;
    case Tile.Chest:
      if (state.keys > 0) {
        state.keys--;
        const whips = RNG.getUniformInt(2, 5);
        const gems = RNG.getUniformInt(2, 5);
        state.whips += whips;
        state.gems += gems;
        addScore(block);
        go(state.player, x, y);
        await screen.flash(
          `You found ${gems} gems and ${whips} whips inside the chest!`,
        );
      }
      break;
    case Tile.SlowTime:
      state.T[Timer.SpeedTime] = 0; // Reset Speed Time
      state.T[Timer.SlowTime] = SPELL_DURATION; // Slow Time
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Gem:
      state.gems++;
      addScore(block);
      go(state.player, x, y);
      screen.flash(block, true);
      break;
    case Tile.Invisible:
      state.T[Timer.Invisible] = SPELL_DURATION;
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Teleport:
      state.teleports++;
      addScore(block);
      go(state.player, x, y);
      screen.flash(block, true);
      break;
    case Tile.Key:
      sound.grab();
      state.keys++;
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Door:
      if (state.keys < 1) {
        sound.play(Math.random() * 129 + 30, 150, 100);
        await screen.flash(block);
      } else {
        sound.openDoor();
        state.keys--;
        addScore(block);
        go(state.player, x, y);
        await screen.flash('The Door opens!  (One of your Keys is used.)');
      }
      break;
    case Tile.Wall:
      sound.blockedWall();
      addScore(block);
      await screen.flash(block, true);
      break;
    case Tile.River:
      addScore(block);
      await screen.flash(block, true);
      break;
    case Tile.SpeedTime:
      state.T[Timer.SlowTime] = 0; // Reset Slow Time
      state.T[Timer.SpeedTime] = SPELL_DURATION; // Speed Time
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Trap:
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      await playerTeleport();
      break;
    case Tile.Power:
      state.whipPower++;
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Tree:
    case Tile.Forest:
      addScore(block);
      await sound.blocked();
      await screen.flash(block, true);
      break;
    case Tile.Bomb: {
      go(state.player, x, y);

      const d = 4;
      const x1 = Math.max(state.player.x - d, XBot);
      const x2 = Math.min(state.player.x + d, XTop);
      const y1 = Math.max(state.player.y - d, YBot);
      const y2 = Math.min(state.player.y + d, YTop);

      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y < y2; y++) {
          const block = (state.PF?.[x]?.[y] as number) ?? Tile.Floor;
          if ([
            0,   1,  2,  3,  4, 13, 16, 19, 28, 29,
            30, 32, 32, 33, 35, 36, 37, 38, 39, 43,
            45, 48, 49, 50, 51, 64, 67, 68, 69, 70,
            71, 72, 73, 74, 224, 225, 226, 227, 228,
            229, 230, 231].includes(block as number)) {
              if (block >= 1 && block <= 4) {
                killAt(x, y);
              }
              state.PF[x][y] = Tile.Floor;
          }
        }
      }

      await screen.flash(block, true);
      break;
    }
    case Tile.Lava:
      state.gems -= 10;
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Pit:
      go(state.player, x, y);
      state.gems = -1; // dead
      await screen.flash(block);
      break;
    case Tile.Tome:
      // Tome_Message;
      addScore(block);
      await screen.flash(block);
      await screen.flash('Congratulations, Adventurer, you finally did it!!!');
      break;
    case Tile.Nugget:
      sound.grab();
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Freeze:
      state.T[Timer.FreezeTime] = SPELL_DURATION;
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Tunnel:
      // Find a random tunnel exit
      // Find a random empty space near exit
      // Move player to exit
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Quake:
      go(state.player, x, y);

      for (let i = 0; i < 2500; i++) {
        sound.play(RNG.getUniformInt(0, i), 5, 100);
        if (i % 25 === 0) await sound.delay();
      }

      await sound.delay(50);
      for (let i = 0; i < 50; i++) {
        do {
          const x = RNG.getUniformInt(0, XSize);
          const y = RNG.getUniformInt(0, YSize);
          const block = state.PF?.[x]?.[y] ?? Tile.Floor;
          if ([
              0, 1, 2, 3, 5, 7, 8, 9, 10, 11, 15, 16, 26, 32, 33, 37, 39, 67,
              224, 225, 226, 227, 228, 229, 230, 231].includes(block as number)) {
                state.PF[x][y] = Tile.Rock;
                drawTile(x, y, Tile.Rock);
                break;
          }
        } while(Math.random() > 0.01);
        for (let i = 0; i < 50; i++) {
          sound.play(RNG.getUniformInt(0, 200), 50, 100);
        }
        await sound.delay(50);
      }

      for (let i = 2500; i > 50; i--) {
        sound.play(RNG.getUniformInt(0, i), 5, 100);
        if (i % 25 === 0) await sound.delay();
      }

      await screen.flash(block, true);
      break;
    case Tile.IBlock:
    case Tile.IDoor:
      await screen.flash(block, true);
      break;
    case Tile.Zap: {
      go(state.player, x, y);

      let t = 0;
      let k = 0;
      while (t < 500 && k < 40) {
        t++;
        const n = RNG.getUniformInt(0, state.entities.length);
        const e = state.entities[n];
        if (!e || e.x === -1 || e.y === -1) continue; // dead
        state.PF[e.x][e.y] = Tile.Floor;
        k++;
      }

      state.score += Math.floor(k / 3 + 2);
      renderPlayfield();
      screen.renderStats();

      await screen.flash(block, true);
      break;
    }
    case Tile.Create:
    case Tile.Generator:
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.MBlock:
      addScore(block);
      await screen.flash(block, true);
      break;
    case Tile.ShowGems:
      go(state.player, x, y);
      await screen.flash(block);
      break;
    case Tile.Tablet:
    case Tile.BlockSpell:
      addScore(block);
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Chance: {
      addScore(block);
      const g = RNG.getUniformInt(14, 18);
      state.gems += g;
      go(state.player, x, y);
      await screen.flash(`You found a Pouch containing ${g} Gems!`);
      break;
    }
    case Tile.Statue:
      go(state.player, x, y);
      await screen.flash(block);
      break;
    case Tile.WallVanish:
      go(state.player, x, y);
      await screen.flash(block);
      break;
    case Tile.K:
    case Tile.R:
    case Tile.O:
    case Tile.Z:
      go(state.player, x, y);
      break;
    case Tile.OWall1:
    case Tile.OWall2:
    case Tile.OWall3:
      sound.blockedWall();
      await screen.flash(Tile.OWall1, true);
      break;
    case Tile.OSpell1:
    case Tile.OSpell2:
    case Tile.OSpell3:
      go(state.player, x, y);
      await screen.flash(Tile.OSpell1, true);
      break;
    case Tile.CSpell1:
    case Tile.CSpell2:
    case Tile.CSpell3:
      go(state.player, x, y);
      await screen.flash(Tile.CSpell1, true);
      break;
    case Tile.Rock: {
      let nogo = false;

      const rx = state.player.x + dx * 2;
      const ry = state.player.y + dy * 2;
      if (rx < 0 || rx > XSize || ry < 0 || ry > YSize) nogo = true;

      if (!nogo) {
        const rb = state.PF?.[rx]?.[ry] ?? Tile.Floor; // TODO: other cases

        // https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST5.MOV#L1366
        switch (rb) {
          case Tile.Floor:
            nogo = false;
            await sound.blockMove();
            state.PF[rx][ry] = Tile.Rock;
            go(state.player, x, y);
            renderPlayfield();
            await screen.flash(Tile.Rock, true);
            break;
          case Tile.Stairs:
            nogo = false;
            await sound.blockMove(); // TODO: change sound
            go(state.player, x, y);
            renderPlayfield();
            await screen.flash(Tile.Rock, true);
            break;
          default:
            nogo = false;
            break
        }
      }

      if (nogo) {
        await sound.blocked();
      }

      break;
    }
    case Tile.EWall:
      addScore(block);
      state.gems--;
      sound.noise();
      await screen.flash(Tile.EWall, true);
      break;
    case Tile.CWall1:
    case Tile.CWall2:
    case Tile.CWall3:
      go(state.player, x, y);
      break;
    case Tile.Trap2:
    case Tile.Trap3:
    case Tile.Trap4:
    case Tile.Trap5:
    case Tile.Trap6:
    case Tile.Trap7:
    case Tile.Trap8:
    case Tile.Trap9:
    case Tile.Trap10:
    case Tile.Trap11:
    case Tile.Trap12:
    case Tile.Trap13:
      go(state.player, x, y);
      break;
    case Tile.TBlind:
    case Tile.TBlock:
    case Tile.TGem:
    case Tile.TGold:
    case Tile.TRock:
    case Tile.TTree:
    case Tile.TWhip:
      go(state.player, x, y);
      break;
    case Tile.Rope:
      go(state.player, x, y);
      await screen.flash(Tile.Rope, true);
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
      go(state.player, x, y);
      break;
    case Tile.Amulet:
      // Got_Amulet
      go(state.player, x, y);
      break;
    default:
      break;
  }
}

async function killAt(x: number, y: number) {
  const block = state.PF?.[x]?.[y] ?? Tile.Floor;

  state.PF[x][y] = Tile.Floor;

  if (block === Tile.Slow || block === Tile.Medium || block === Tile.Fast) {
    for (let i = 0; i < state.entities.length; i++) {
      const m = state.entities[i];
      if (m.x === x && m.y === y) {
        state.gems += m.type;
        await sound.play(130, 50);
        m.kill();
      }
    }
  }

  // renderPlayfield();
}

function go(e: Entity, x: number, y: number) {
  const px = e.x;
  const py = e.y;

  e.move(x, y);

  state.PF[px][py] = Tile.Floor;
  state.PF[x][y] = e.type;

  renderPlayfield();
  // drawTile(px, py);
  // drawTile(e.x, e.y, e.ch, TileColor[e.type][0]!, TileColor[Tile.Floor][1]!);
}

async function playerWhip() {
  const PX = state.player.x;
  const PY = state.player.y;

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
  for (let i = 0; i < 80; i++) {
    drawTile(state.player.x, state.player.y, Tile.Player, RNG.getUniformInt(0, 15), RNG.getUniformInt(0, 8));
    await sound.delay(1);
    sound.play(i / 2, 1000, 30);
  }

  // for (let i = 0; i < 250; i++) {
  //   drawTile(state.player.x, state.player.y, Tile.Player, RNG.getUniformInt(0, 15), RNG.getUniformInt(0, 15));
  //   await sound.play(20, 1, 100);
  // }
}

async function playerTeleport() {
  await flashPlayer();

  state.PF[state.player.x][state.player.y] = Tile.Floor;
  drawTile(state.player.x, state.player.y);

  // const t = Date.now();
  // while (Date.now() - t < 3000) {
  //   const x = RNG.getUniformInt(0, XSize);
  //   const y = RNG.getUniformInt(0, YSize);
  //   const block = state.PF?.[x]?.[y] ?? Tile.Floor;
  //   if ([Tile.Floor].indexOf(block as Tile) > -1) {
  //     drawTile(x, y, Tile.Player);
  //     await sound.play(20, 10, 100);
  //     drawTile(x, y, block);
  //   }
  // }

  for (let i = 0; i < 700; i++) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.PF?.[x]?.[y] ?? Tile.Floor;
    if ([Tile.Floor].indexOf(block as Tile) > -1) {
      drawTile(x, y, '☺', RNG.getUniformInt(0, 15), RNG.getUniformInt(0, 7));
      await sound.play(20, 10, 100);
      drawTile(x, y, block);
    }
  }

  while (true) {
    const x = RNG.getUniformInt(0, XSize);
    const y = RNG.getUniformInt(0, YSize);
    const block = state.PF?.[x]?.[y] ?? Tile.Floor;
    if (block === Tile.Floor) {
      state.PF[x][y] = Tile.Player;
      state.player.x = x;
      state.player.y = y;
      renderPlayfield();
      break;
    }
  }
}

export function renderPlayfield() {
  for (let x = 0; x < state.PF.length; x++) {
    for (let y = 0; y < state.PF[x].length; y++) {
      // Skip entities, will be rendered later
      const b = state.PF[x][y] || Tile.Floor;
      if (b === Tile.Player) continue;
      if (b === Tile.Slow || b === Tile.Medium || b === Tile.Fast) continue;

      drawTile(x, y, state.PF[x][y] || Tile.Floor);
    }
  }

  const floorColor = TileColor[Tile.Floor][1]!;

  for (let i = 0; i < state.entities.length; i++) {
    const e = state.entities[i];
    if (e.x === -1 || e.y === -1) continue; // dead
    drawTile(e.x, e.y, e.getChar(), TileColor[e.type][0]!, floorColor);
  }

  drawTile(state.player.x, state.player.y, state.player.getChar(), TileColor[state.player.type][0]!, floorColor);
}

export function drawTile(x: number, y: number, block: Tile | string = Tile.Floor, fg?: Color | string, bg?: Color | string) {
  let ch: string;

  if (typeof block === 'number') {
    ch = TileChar[block] ?? block ?? TileChar[Tile.Floor]
    fg = fg ?? TileColor[block as unknown as Tile]?.[0] ?? TileColor[Tile.Floor][0]!;
    bg = bg ?? TileColor[block as unknown as Tile]?.[1] ?? TileColor[Tile.Floor][1]!;
  } else if (block >= 'a' && block <= 'z') {
    ch = block.toUpperCase();
    fg = fg ?? Color.HighIntensityWhite;
    bg = bg ?? Color.Brown;
  } else {
    ch = block as string;
  }

  switch (block) {
    case Tile.Stairs:
      fg = typeof fg === 'number' && !state.paused ? fg | 16 : fg; // add blink
      break
  }



  display.draw(x + XBot, y + YBot, ch, fg, bg);
}

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
async function hit(x: number, y: number, ch: string) {
  const thing = state.PF?.[x]?.[y] ?? Tile.Floor;

  display.drawOver(
    x + XBot,
    y + YBot,
    ch,
    ColorCodes[RNG.getUniformInt(0, 15) as Color]
  );

  switch (thing) {
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast: // Kill
      killAt(x, y);
      break;
    case Tile.Block:
    case Tile.Forest:
    case Tile.Tree:
    case Tile.Message: { // Destroy?
      const w = state.whipPower;
      if (6 * Math.random() < w) {
        sound.play(130, 50);
        state.PF[x][y] = Tile.Floor;
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
    case Tile.Generator:
    case Tile.K:
    case Tile.R:
    case Tile.O:
    case Tile.Z: // Break
      state.PF[x][y] = Tile.Floor;
      sound.play(400, 50);
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
    case Tile.Trap13: // Break
    case Tile.Stop:
      state.PF[x][y] = Tile.Floor;
      break;
    case Tile.Wall:
    case Tile.Statue:
    case Tile.Rock:
    case Tile.ZBlock:
    case Tile.GBlock:
    case Tile.MBlock:
    // TBD
    // eslint-disable-next-line no-fallthrough
    default:
      break;
  }
  screen.renderStats();
  await sound.delay(10);
}

function addScore(block: Tile) {
  switch (block) {
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.score += block;
      break;
    case Tile.Block:
    case Tile.Wall:
    case Tile.River:
    case Tile.Tree:
    case Tile.Forest:
    case Tile.MBlock:
    case Tile.OWall1:
    case Tile.OWall2:
    case Tile.OWall3:
    case Tile.EWall:
      if (state.score > 2) state.score -= 2;
      break;
    case Tile.Whip:
    case Tile.SlowTime:
    case Tile.Bomb:
      state.score++;
      break;
    case Tile.Stairs:
      state.score += state.level * 5;
      break;
    case Tile.Chest:
      state.score += 10 + Math.floor(state.level / 2);
      break;
    case Tile.Gem:
      state.score += Math.floor(state.level / 2) + 1;
      break;
    case Tile.Invisible:
      state.score += 25;
      break;
    case Tile.Teleport:
    case Tile.Freeze:
    case Tile.Door:
      state.score += 2;
      break;
    case Tile.SpeedTime:
    case Tile.Power:
      state.score += 5;
      break;
    case Tile.Trap:
      if (state.score > 5) state.score -= 5;
      break;
    case Tile.Lava:
      if (state.score > 100) state.score += 100;
      break;
    case Tile.Tome:
      state.score += 5000;
      break;
    case Tile.Tablet:
      state.score += state.level + 2500;
      break;
    case Tile.Chance:
      state.score += 100;
      break;
    // case Tile.Border:
    //   if (state.score > state.level) state.score -= Math.floor(state.level / 2);
    //   break;
  }

  screen.renderStats();
}

export async function dead() {
  display.drawText(XTop / 2 - 7, 0, 'You have died.', Color.Black, Color.Red);
  await screen.flash('Press any key to continue.', false);
  state.done = true;
}

async function endRoutine() {
  await sound.footStep();
  await sound.delay(200);
  await sound.footStep();
  await sound.delay(200);
  await sound.footStep();

  await screen.flash('Oh no, something strange is happening!');
  await screen.flash('You are magically transported from Kroz!');

  // Check for infinite items
  const gems = state.gems = isFinite(state.gems) ? state.gems : 150;
  const whips = state.whips = isFinite(state.whips) ? state.whips : 20;
  const teleports = state.teleports = isFinite(state.teleports) ? state.teleports : 10;
  const keys = state.keys = isFinite(state.keys) ? state.keys : 5;

  await screen.flash('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    state.gems--;
    state.score += 10;
    screen.renderStats();
    await sound.play(i*8+100, 20);
  }

  await screen.flash('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    state.whips--;
    state.score += 10;
    screen.renderStats();
    await sound.play(i*8+100, 20);
  }

  await screen.flash('Your Teleport Scrolls are worth 200 points each...');
  for (let i = 0; i < teleports; i++) {
    state.teleports--;
    state.score += 20;
    screen.renderStats();
    await sound.play(i*8+100, 20);
  }

  await screen.flash('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    state.keys--;
    state.score += 1000;
    screen.renderStats();
    await sound.play(i*8+100, 20);
  }

  display.clear();

  display.gotoxy(25, 3);
  display.bak(Color.Blue);

  display.writeln('ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ');

  display.gotoxy(15, 5);
  display.writeln('   Carefully, you place the ancient tome on your table and open');
  display.writeln(' to the first page.  You read the book intently, quickly');
  display.writeln(' deciphering the archaic writings.');
  display.writeln('   You learn of Lord Dullwit, the once powerful and benevolent');
  display.writeln(' ruler of Kroz, who sought wealth and education for his people.');
  display.writeln(' The magnificent kingdom of Kroz was once a great empire, until');
  display.writeln(' it was overthrown by an evil Wizard, who wanted the riches of');
  display.writeln(' Kroz for himself.');
  display.writeln('   Using magic beyond understanding, the Wizard trapped Lord');
  display.writeln(' Dullwit and his people in a chamber so deep in Kroz that any');
  display.writeln(' hope of escape was fruitless.');
  display.writeln('   The Wizard then built hundreds of deadly chambers that would');
  display.writeln(' stop anyone from ever rescuing the good people of Kroz.');
  display.writeln('   Once again your thoughts becomes clear:  To venture into the');
  display.writeln(' depths once more and set free the people of Kroz, in:');
  display.writeln('');

  await screen.flash('Press any key, Adventurer.');
  state.done = true;
}

export function getTimeScale() {
  if (state.T[Timer.SlowTime] > 0) return 0.1; // Slow Time
  if (state.T[Timer.SpeedTime] > 0) return 100; // Speed Time
  return 1;
}

// https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST1.LEV#L1270
// endRoutine
