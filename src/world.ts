import { RNG } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as sound from './sound';
import * as screen from './screen';

import {
  TileChar,
  TileColor,
  MapLookup,
  Tile,
  BOMBABLES,
  ROCKABLES,
  VISUAL_TELEPORTABLES,
  TileMessage,
} from './tiles';
import {
  DEBUG,
  FLOOR_CHAR,
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
import { delay } from './utils';
import { Level, LEVELS } from './levels';
import dedent from 'ts-dedent';

export const enum Timer {
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
}

const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * TIME_SCALE,
  [Timer.Invisible]: 75 * TIME_SCALE,
  [Timer.SpeedTime]: 80 * TIME_SCALE,
  [Timer.FreezeTime]: 55 * TIME_SCALE,
};

export const state = getDefaultState();

const levelStartState = {
  levelIndex: 0,
  score: 0,
  gems: 20,
  whips: 0,
  teleports: 0,
  keys: 0,
  whipPower: 2,
};

const saveState = {
  levelIndex: 0,
  score: 0,
  gems: 20,
  whips: 0,
  teleports: 0,
  keys: 0,
  whipPower: 2,
};

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
      0,
    ], // Timers

    levelIndex: DEBUG ? 0 : 1,
    level: null as null | Level,
    score: 0,
    gems: 20,
    whips: 0,
    teleports: 0,
    keys: 0,
    whipPower: 2,

    actionActive: false,
    paused: false,
    done: false,

    // TODO:
    // hideGems
    // hideStairs
    // HideMBlock
    // HideCreate
    // TreeRate ??
    // HideOpenWall
    // LavaFlow
    // LavaRate
  };
}

export function resetState() {
  Object.assign(state, getDefaultState());
}

export function loadLevel() {
  state.level = LEVELS[state.levelIndex];
  readLevelMap(state.level.map);

  state.T = state.T.map(() => 0); // Reset timers

  Object.assign(levelStartState, state);

  renderPlayfield();
  screen.renderStats();
}

export async function nextLevel() {
  state.levelIndex = mod(state.levelIndex + 1, LEVELS.length);
  loadLevel();
  await screen.flashMessage('Press any key to begin this level.');
}

async function prevLevel() {
  state.levelIndex = mod(state.levelIndex - 1, LEVELS.length);
  loadLevel();
  await screen.flashMessage('Press any key to begin this level.');
}

export async function effects() {
  state.T = state.T.map((t) => (t > 0 ? t - 1 : 0));

  // TODO: Creature generation
  // Lava Flow
  // Gravity
  // MagitEWalls
  // Evaporate
  // TreeGrow
}

async function mobAction(e: Entity) {
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
      state.PF[e.x][e.y] = Tile.Floor;
      state.PF[x][y] = Tile.Floor;
      e.kill();
      addScore(block);
      sound.play(800, 18);
      sound.play(400, 20);
      break;
    case Tile.Player: // Damage + Kills
      state.gems--;
      state.PF[e.x][e.y] = Tile.Floor;
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

  if (state.T[Timer.FreezeTime] > 0) return;

  for (let i = 0; i < state.entities.length; i++) {
    const e = state.entities[i];
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
    Object.assign(saveState, levelStartState);
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
    Object.assign(state, saveState);
    loadLevel();
  }
}

export async function playerAction() {
  const actionState = controls.pollActions();

  // Move these?
  if (actionState[Action.FreeItems])
    return await doPlayerAction(Action.FreeItems);
  if (actionState[Action.NextLevel])
    return await doPlayerAction(Action.NextLevel);
  if (actionState[Action.PrevLevel])
    return await doPlayerAction(Action.PrevLevel);
  // if (actionState[Action.HideFound]) await doPlayerAction(Action.Teleport); // TBD
  if (actionState[Action.ResetFound]) return (state.foundSet = new Set());
  if (actionState[Action.Pause]) return pause();
  if (actionState[Action.Quit]) return quit();

  if (actionState[Action.Save]) return save();
  if (actionState[Action.Restore]) return restore();

  if (actionState[Action.North] && actionState[Action.West])
    return await doPlayerAction(Action.Northwest);
  if (actionState[Action.North] && actionState[Action.East])
    return await doPlayerAction(Action.Northeast);
  if (actionState[Action.South] && actionState[Action.West])
    return await doPlayerAction(Action.Southwest);
  if (actionState[Action.South] && actionState[Action.East])
    return await doPlayerAction(Action.Southeast);

  if (actionState[Action.North]) return await doPlayerAction(Action.North);
  if (actionState[Action.South]) return await doPlayerAction(Action.South);
  if (actionState[Action.West]) return await doPlayerAction(Action.West);
  if (actionState[Action.East]) return await doPlayerAction(Action.East);
  if (actionState[Action.Southeast])
    return await doPlayerAction(Action.Southeast);
  if (actionState[Action.Southwest])
    return await doPlayerAction(Action.Southwest);
  if (actionState[Action.Northeast])
    return await doPlayerAction(Action.Northeast);
  if (actionState[Action.Northwest])
    return await doPlayerAction(Action.Northwest);

  if (actionState[Action.Whip]) return await doPlayerAction(Action.Whip);
  if (actionState[Action.Teleport])
    return await doPlayerAction(Action.Teleport);
}

async function doPlayerAction(action: Action) {
  let _tryPlayerMove = false;

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
      await tryPlayerMove(0, -1);
      _tryPlayerMove = true;
      break;
    case Action.South:
      await tryPlayerMove(0, +1);
      _tryPlayerMove = true;
      break;
    case Action.West:
      await tryPlayerMove(-1, 0);
      _tryPlayerMove = true;
      break;
    case Action.East:
      await tryPlayerMove(+1, 0);
      _tryPlayerMove = true;
      break;
    case Action.Southeast:
      await tryPlayerMove(+1, +1);
      _tryPlayerMove = true;
      break;
    case Action.Southwest:
      await tryPlayerMove(-1, +1);
      _tryPlayerMove = true;
      break;
    case Action.Northeast:
      await tryPlayerMove(+1, -1);
      _tryPlayerMove = true;
      break;
    case Action.Northwest:
      await tryPlayerMove(-1, -1);
      _tryPlayerMove = true;
      break;
    case Action.Whip:
      if (state.whips < 1) {
        sound.noneSound();
      } else {
        state.whips--;
        await playerWhip();
      }
      _tryPlayerMove = true;
      break;
    case Action.Teleport:
      if (state.teleports < 1) {
        await sound.noneSound();
      } else {
        state.teleports--;
        await playerTeleport();
      }
      _tryPlayerMove = true;
      break;
  }
  return _tryPlayerMove;
}

function readLevelMap(level: string) {
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

async function tryPlayerMove(dx: number, dy: number) {
  const x = state.player.x + dx;
  const y = state.player.y + dy;

  if (x < 0 || x > XSize || y < 0 || y > YSize) return;
  // flashTileMessage(16,25,'An Electrified Wall blocks your way.');

  const block = state.PF?.[x]?.[y] || Tile.Floor;

  switch (block) {
    case Tile.Floor:
    case Tile.Stop:
      go(state.player, x, y);
      break;
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.gems -= block;
      killAt(x, y);
      addScore(block);
      go(state.player, x, y);
      break;
    case Tile.Block:
    case Tile.ZBlock:
    case Tile.GBlock:
      addScore(block);
      await flashTileMessage(Tile.Block, true);
      break;
    case Tile.Whip:
      sound.grab();
      state.whips++;
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(Tile.Whip, true);
      break;
    case Tile.Stairs:
      if (state.levelIndex === LEVELS.length - 1) {
        go(state.player, x, y);
        await endRoutine();
        return;
      }
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(Tile.Stairs, true);
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
        await screen.flashMessage(
          `You found ${gems} gems and ${whips} whips inside the chest!`,
        );
      }
      break;
    case Tile.SlowTime:
      state.T[Timer.SpeedTime] = 0; // Reset Speed Time
      state.T[Timer.FreezeTime] = 0;
      state.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Gem:
      state.gems++;
      addScore(block);
      go(state.player, x, y);
      flashTileMessage(block, true);
      break;
    case Tile.Invisible:
      state.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Teleport:
      state.teleports++;
      addScore(block);
      go(state.player, x, y);
      flashTileMessage(block, true);
      break;
    case Tile.Key:
      sound.grab();
      state.keys++;
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Door:
      if (state.keys < 1) {
        sound.play(Math.random() * 129 + 30, 150, 100);
        await delay(100);
        await flashTileMessage(block);
      } else {
        state.keys--;
        addScore(block);
        await sound.openDoor();
        go(state.player, x, y);
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
      state.T[Timer.SlowTime] = 0; // Reset Slow Time
      state.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Trap:
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      await playerTeleport();
      break;
    case Tile.Power:
      state.whipPower++;
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Tree:
    case Tile.Forest:
      addScore(block);
      await sound.blocked();
      await flashTileMessage(block, true);
      break;
    case Tile.Bomb: {
      go(state.player, x, y);

      const d = 4;
      const x1 = Math.max(state.player.x - d, XBot);
      const x2 = Math.min(state.player.x + d, XTop);
      const y1 = Math.max(state.player.y - d, YBot);
      const y2 = Math.min(state.player.y + d, YTop);

      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          const block = (state.PF?.[x]?.[y] as number) ?? Tile.Floor;
          if (BOMBABLES.includes(block as number)) {
            if (block >= 1 && block <= 4) {
              addScore(block);
              await killAt(x, y);
            }
            state.PF[x][y] = Tile.Floor;
          }
        }
      }

      await flashTileMessage(block, true);
      break;
    }
    case Tile.Lava:
      state.gems -= 10;
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Pit:
      go(state.player, x, y);
      if (!DEBUG) state.gems = -1; // dead
      await flashTileMessage(block);
      break;
    case Tile.Tome:
      // Tome_Message;
      // Tome_Effects

      state.PF[31][6] = Tile.Stairs;
      drawTile(31, 6, Tile.Stairs);

      addScore(block);
      await flashTileMessage(block);
      await screen.flashMessage(
        'Congratulations, Adventurer, you finally did it!!!',
      );
      break;
    case Tile.Nugget:
      sound.grab();
      go(state.player, x, y);
      addScore(block);
      await flashTileMessage(block, true);
      break;
    case Tile.Freeze:
      state.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Tunnel:
      // TODO:
      // Find a random tunnel exit
      // Find a random empty space near exit
      // Move player to exit
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.Quake:
      go(state.player, x, y);

      for (let i = 0; i < 2500; i++) {
        sound.play(RNG.getUniformInt(0, i), 5, 100);
        if (i % 25 === 0) await delay();
      }

      await delay(50);
      for (let i = 0; i < 50; i++) {
        do {
          const x = RNG.getUniformInt(0, XSize);
          const y = RNG.getUniformInt(0, YSize);
          const block = state.PF?.[x]?.[y] ?? Tile.Floor;
          if (ROCKABLES.includes(block as number)) {
            state.PF[x][y] = Tile.Rock;
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
      state.PF[x][y] = Tile.Wall;
      drawTile(x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.IBlock:
      sound.blockedWall();
      state.PF[x][y] = Tile.Block;
      drawTile(x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.IDoor:
      sound.blockedWall();
      state.PF[x][y] = Tile.Door;
      drawTile(x, y);
      await flashTileMessage(block, true);
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
        await killAt(e.x, e.y);
        await delay(20);
        k++;
      }

      state.score += Math.floor(k / 3 + 2);
      renderPlayfield();
      screen.renderStats();

      await flashTileMessage(block, true);
      break;
    }
    case Tile.Create:
    case Tile.Generator:
      addScore(block);
      go(state.player, x, y);
      await flashTileMessage(block, true);
      break;
    case Tile.MBlock:
      addScore(block);
      await flashTileMessage(block, true);
      break;
    case Tile.ShowGems:
      go(state.player, x, y);
      await flashTileMessage(block);
      break;
    case Tile.Tablet:
      go(state.player, x, y);
      sound.grab();
      addScore(block);
      await flashTileMessage(block, true);
      await tabletMessage();
      break;
    case Tile.BlockSpell: {
      go(state.player, x, y);
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.PF[x][y] === Tile.ZBlock) {
            sound.play(200, 60, 100);
            for (let i = 20; i > 0; i--) {
              drawTile(x, y, Tile.Block, RNG.getUniformInt(0, 15));
              await delay(3);
            }
            state.PF[x][y] = Tile.Floor;
            drawTile(x, y);
          } else if (state.PF[x][y] === Tile.BlockSpell) {
            state.PF[x][y] = Tile.Block;
            drawTile(x, y);
          }
        }
      }
      await flashTileMessage(block, true);
      break;
    }
    case Tile.Chance: {
      addScore(block);
      const g = RNG.getUniformInt(14, 18);
      state.gems += g;
      go(state.player, x, y);
      await screen.flashMessage(`You found a Pouch containing ${g} Gems!`);
      break;
    }
    case Tile.Statue:
      go(state.player, x, y);
      await flashTileMessage(block);
      break;
    case Tile.WallVanish:
      go(state.player, x, y);
      await flashTileMessage(block);
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
      await flashTileMessage(Tile.OWall1, true);
      break;
    case Tile.OSpell1:
    case Tile.OSpell2:
    case Tile.OSpell3: {
      go(state.player, x, y);

      let s = Tile.OWall1;
      if (block === Tile.OSpell2) s = Tile.OWall2;
      if (block === Tile.OSpell3) s = Tile.OWall3;

      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          const block = state.PF?.[x]?.[y] ?? Tile.Floor;
          if (block === s) {
            for (let i = 60; i > 0; i--) {
              drawTile(x, y, Tile.Wall, RNG.getUniformInt(0, 14));
              sound.play(i * 40, 5, 10);
              if (i % 5 === 0) await delay(1);
            }

            drawTile(x, y, Tile.Wall);
            // await delay(8);
            state.PF[x][y] = Tile.Floor;
            drawTile(x, y);
          }
        }
      }

      await flashTileMessage(Tile.OSpell1, true);
      break;
    }
    case Tile.CSpell1:
    case Tile.CSpell2:
    case Tile.CSpell3:
      go(state.player, x, y);
      await flashTileMessage(Tile.CSpell1, true);
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
            await flashTileMessage(Tile.Rock, true);
            break;
          case Tile.Stairs:
            nogo = false;
            await sound.blockMove(); // TODO: change sound
            go(state.player, x, y);
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
      state.gems--;
      sound.noise();
      await flashTileMessage(Tile.EWall, true);
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
      go(state.player, x, y);
      break;
    case Tile.Amulet:
      go(state.player, x, y);
      await gotAmulet();
      break;
    default:
      break;
  }
}

async function flashTileMessage(msg: number, once: boolean = false) {
  if (once) {
    if (state.foundSet.has(msg)) return '';
    state.foundSet.add(msg);
  }

  const str = TileMessage[msg];
  if (!str) return '';

  return await screen.flashMessage(str);
}

async function killAt(x: number, y: number) {
  const block = state.PF?.[x]?.[y] ?? Tile.Floor;

  state.PF[x][y] = Tile.Floor;

  if (block === Tile.Slow || block === Tile.Medium || block === Tile.Fast) {
    for (let i = 0; i < state.entities.length; i++) {
      const m = state.entities[i];
      if (m.x === x && m.y === y) {
        await m.kill();
      }
    }
  }

  renderPlayfield();
}

function go(e: Entity, x: number, y: number) {
  const px = e.x;
  const py = e.y;

  e.move(x, y);

  state.PF[px][py] = Tile.Floor;
  state.PF[x][y] = e.type;

  renderPlayfield();
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
    drawTile(
      state.player.x,
      state.player.y,
      Tile.Player,
      RNG.getUniformInt(0, 15),
      RNG.getUniformInt(0, 8),
    );
    await delay(1);
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
    if (VISUAL_TELEPORTABLES.indexOf(block as Tile) > -1) {
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

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER/LOST4.TIT#L399
async function hit(x: number, y: number, ch: string) {
  const thing = state.PF?.[x]?.[y] ?? Tile.Floor;

  display.drawOver(
    x + XBot,
    y + YBot,
    ch,
    ColorCodes[RNG.getUniformInt(0, 15) as Color],
  );

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
    case Tile.IBlock:
    case Tile.IWall:
    case Tile.IDoor:
    case Tile.Quake:
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
    case Tile.Rock:
      if (30 * Math.random() < state.whipPower) {
        sound.play(130, 50);
        state.PF[x][y] = Tile.Floor;
      } else {
        sound.play(130, 25);
        sound.play(90, 50);
      }
      break;
    case Tile.MBlock:
    case Tile.ZBlock:
    case Tile.GBlock: {
      if (6 * Math.random() < state.whipPower) {
        sound.play(130, 50);
        state.PF[x][y] = Tile.Floor;
      } else {
        sound.play(130, 25);
        sound.play(90, 50);
      }
      break;
    }
    case Tile.Wall:
    case Tile.Statue:
    // TBD
    // eslint-disable-next-line no-fallthrough
    default:
      break;
  }
  screen.renderStats();
  await delay(10);
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

  drawTile(
    state.player.x,
    state.player.y,
    state.player.getChar(),
    TileColor[state.player.type][0]!,
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
      break;
  }

  display.draw(x + XBot, y + YBot, ch, fg, bg);
}

function addScore(block: Tile) {
  switch (block) {
    case Tile.Slow:
    case Tile.Medium:
    case Tile.Fast:
      state.score += block;
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
      if (state.score > 2) state.score -= 2;
      break;
    case Tile.Whip:
    case Tile.SlowTime:
    case Tile.Bomb:
      state.score++;
      break;
    case Tile.Stairs:
      state.score += state.levelIndex * 5;
      break;
    case Tile.Chest:
      state.score += 10 + Math.floor(state.levelIndex / 2);
      break;
    case Tile.Gem:
      state.score += Math.floor(state.levelIndex / 2) + 1;
      break;
    case Tile.Invisible:
      state.score += 25;
      break;
    case Tile.Nugget:
      state.score += 50;
      break;
    case Tile.Door:
      state.score += 10;
      break;
    case Tile.Teleport:
    case Tile.Freeze:
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
      state.score += state.levelIndex + 250;
      break;
    case Tile.Chance:
      state.score += 100;
      break;
    case Tile.Amulet:
      state.score += 2500;
      break;
    // case Tile.Border:
    //   if (state.score > state.level) state.score -= Math.floor(state.levelIndex/ 2);
    //   break;
  }

  screen.renderStats();
}

export async function dead() {
  display.drawText(XTop / 2 - 7, 0, 'You have died.', Color.Black, Color.Red);
  await screen.flashMessage('Press any key to continue.');
  state.done = true;
}

async function quit() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to quit? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    state.done = true;
  }
}

async function pause() {
  await screen.flashMessage('Press any key to resume');
}

// See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L45
async function tabletMessage() {
  switch (state.level!.id) {
    case 'Debug':
    case 'Lost30':
      await prayer();
      await screen.flashMessage(
        '"If goodness is in my heart, that which flows shall..."',
      );

      // Replace River with Nugget
      for (let x = 0; x <= XSize; x++) {
        for (let y = 0; y <= YSize; y++) {
          if (state.PF[x][y] === Tile.River) {
            await sound.play(x * y, 50, 10);
            state.PF[x][y] = Tile.Nugget;
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
          if (state.PF[x][y] === Tile.River) {
            await sound.play(x * y, 50, 10);
            state.PF[x][y] = Tile.Block;
            drawTile(x, y, Tile.Block);
          }
        }
      }

      await screen.flashMessage('"...Overcome!"');

      break;
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
  display.bak(Color.Blue);
  display.col(Color.LightCyan);

  display.clear(Color.Blue);

  display.gotoxy(2, 5);
  display.writeln(dedent`
    In the mystical Kingdom of Kroz, where ASCII characters come to life and
    danger lurks around every corner, a new chapter unfolds. You, a brave
    archaeologist, have heard whispers of the legendary Magical Amulet of Kroz,
    an artifact of immense power long thought lost to time.

    Will you be the one to uncover the secrets of the forsaken caverns? Can you
    retrieve the Magical Amulet and restore glory to the Kingdom of Kroz? The
    adventure awaits, brave explorer!

  `);

  display.gotoxy(9, 16);
  display.writeln(
    `Use the cursor keys to move yourself (%c{${TileColor[Tile.Player][0]}}${TileChar[Tile.Player]}%c{${ColorCodes[Color.LightGreen]}}) through the caverns.`,
    Color.LightGreen,
  );
  display.writeCenter(
    `Use your whip (press W) to destroy all nearby creatures.`,
    Color.LightGreen,
  );

  display.gotoxy(0, HEIGHT - 1);
  display.writeCenter(
    'Press any key to begin your decent into Kroz.',
    Color.HighIntensityWhite,
  );

  const x = WIDTH / 2 - TITLE.length / 2;
  const readkey = controls.readkey();
  while (!readkey()) {
    display.drawText(x, 3, TITLE, RNG.getUniformInt(0, 16), Color.Red);
    await delay(500);
  }
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
  const gems = (state.gems = isFinite(state.gems) ? state.gems : 150);
  const whips = (state.whips = isFinite(state.whips) ? state.whips : 20);
  const teleports = (state.teleports = isFinite(state.teleports)
    ? state.teleports
    : 10);
  const keys = (state.keys = isFinite(state.keys) ? state.keys : 5);

  await screen.flashMessage('Your Gems are worth 100 points each...');

  for (let i = 0; i < gems; i++) {
    state.gems--;
    state.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Whips are worth 100 points each...');
  for (let i = 0; i < whips; i++) {
    state.whips--;
    state.score += 10;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage(
    'Your Teleport Scrolls are worth 200 points each...',
  );
  for (let i = 0; i < teleports; i++) {
    state.teleports--;
    state.score += 20;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  await screen.flashMessage('Your Keys are worth 10,000 points each....');
  for (let i = 0; i < keys; i++) {
    state.keys--;
    state.score += 1000;
    screen.renderStats();
    await sound.play(i * 8 + 100, 20);
  }

  display.clear(Color.Blue);

  display.gotoxy(25, 3);
  display.col(Color.White);
  display.bak(Color.Blue);

  display.writeln('ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ');

  display.gotoxy(15, 5);
  display.writeln(
    '   Carefully, you place the ancient tome on your table and open',
  );
  display.writeln(' to the first page.  You read the book intently, quickly');
  display.writeln(' deciphering the archaic writings.');
  display.writeln(
    '   You learn of Lord Dullwit, the once powerful and benevolent',
  );
  display.writeln(
    ' ruler of Kroz, who sought wealth and education for his people.',
  );
  display.writeln(
    ' The magnificent KINGDOM OF KROZ was once a great empire, until',
  );
  display.writeln(
    ' it was overthrown by an evil Wizard, who wanted the riches of',
  );
  display.writeln(' Kroz for himself.');
  display.writeln(
    '   Using magic beyond understanding, the Wizard trapped Lord',
  );
  display.writeln(
    ' Dullwit and his people in a chamber so deep in Kroz that any',
  );
  display.writeln(' hope of escape was fruitless.');
  display.writeln(
    '   The Wizard then built hundreds of deadly chambers that would',
  );
  display.writeln(' stop anyone from ever rescuing the good people of Kroz.');
  display.writeln(
    '   Once again your thoughts becomes clear:  To venture into the',
  );
  display.writeln(' depths once more and set free the people of Kroz, in:');
  display.writeln('');

  await screen.flashMessage('Press any key, Adventurer.');
  state.done = true;
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
