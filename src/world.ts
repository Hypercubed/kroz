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
} from './tiles';
import {
  DEBUG,
  FLOOR_CHAR,
  XBot,
  XSize,
  XTop,
  YBot,
  YSize,
  YTop,
} from './constants';
import { Entity, EntityType } from './entities';
import { Action } from './controls';

import { LEVEL, LEVELS } from './levels';
import { Color, ColorCodes } from './colors';
import { mod } from 'rot-js/lib/util';
import { delay } from './utils';

export enum Timer {
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
}

const S = 5; // Overall time scale... impacts creatre move speed and spell duration
const SPELL_DURATION = {
  [Timer.SlowTime]: 70 * S,
  [Timer.Invisible]: 75 * S,
  [Timer.SpeedTime]: 80 * S,
  [Timer.FreezeTime]: 55 * S,
};

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
      0,
    ], // Timers

    level: DEBUG ? 0 : 1,
    levelId: DEBUG ? 0 : 1,
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
  const level = LEVELS[state.level];
  state.levelId = level.id;
  readLevelMap(level.map);

  state.T = state.T.map(() => 0); // Reset timers
  renderPlayfield();
  screen.renderStats();
}

export async function nextLevel() {
  state.level = mod(state.level + 1, LEVELS.length);
  loadLevel();
  await screen.flash('Press any key to begin this level.');
}

async function prevLevel() {
  state.level = mod(state.level - 1, LEVELS.length);
  loadLevel();
  await screen.flash('Press any key to begin this level.');
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

export async function playerAction() {
  const actionState = controls.pollActions();

  if (actionState[Action.FreeItems]) await doPlayerAction(Action.FreeItems);
  if (actionState[Action.NextLevel]) await doPlayerAction(Action.NextLevel);
  if (actionState[Action.PrevLevel]) await doPlayerAction(Action.PrevLevel);
  // if (actionState[Action.HideFound]) await doPlayerAction(Action.Teleport); // TBD
  if (actionState[Action.ResetFound]) state.foundSet = new Set();
  if (actionState[Action.Pause]) pause();
  if (actionState[Action.Quit]) quit();

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
      addScore(block);
      break;
    case Tile.Block:
    case Tile.ZBlock:
    case Tile.GBlock:
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
        await screen.endRoutine();
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
      state.T[Timer.SlowTime] = SPELL_DURATION[Timer.SlowTime]; // Slow Time
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
      state.T[Timer.Invisible] = SPELL_DURATION[Timer.Invisible];
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
      state.T[Timer.SpeedTime] = SPELL_DURATION[Timer.SpeedTime]; // Speed Time
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
      if (!DEBUG) state.gems = -1; // dead
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
      addScore(block);
      await screen.flash(block, true);
      break;
    case Tile.Freeze:
      state.T[Timer.FreezeTime] = SPELL_DURATION[Timer.FreezeTime];
      go(state.player, x, y);
      await screen.flash(block, true);
      break;
    case Tile.Tunnel:
      // TODO:
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

      await screen.flash(block, true);
      break;
    case Tile.IWall:
      sound.blockedWall();
      state.PF[x][y] = Tile.Wall;
      drawTile(x, y);
      await screen.flash(block, true);
      break;
    case Tile.IBlock:
      sound.blockedWall();
      state.PF[x][y] = Tile.Block;
      drawTile(x, y);
      await screen.flash(block, true);
      break;
    case Tile.IDoor:
      sound.blockedWall();
      state.PF[x][y] = Tile.Door;
      drawTile(x, y);
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
        await killAt(e.x, e.y);
        await delay(20);
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
      // Tablet_Message
      // TODO: Reading the tablet has effects on some levels
      // See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L45

      go(state.player, x, y);
      sound.grab();
      addScore(block);
      await screen.flash(block, true);
      await tabletMessage();
      break;
    case Tile.BlockSpell: {
      go(state.player, x, y);
      for (let x = 0; x < XSize; x++) {
        for (let y = 0; y < YSize; y++) {
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
      await screen.flash(block, true);
      break;
    }
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
    case Tile.OSpell3: {
      go(state.player, x, y);

      let s = Tile.OWall1;
      if (block === Tile.OSpell2) s = Tile.OWall2;
      if (block === Tile.OSpell3) s = Tile.OWall3;

      for (let x = 0; x < XSize; x++) {
        for (let y = 0; y < YSize; y++) {
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

      await screen.flash(Tile.OSpell1, true);
      break;
    }
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
      go(state.player, x, y);
      await gotAmulet();
      break;
    default:
      break;
  }
}

async function gotAmulet() {
  await sound.grab();
  for (let x = 45; x >= 11; x--) {
    for (let y = 13; y >= 1; y--) {
      await sound.play(x * x * y, y + 1, 100);
    }
  }
  addScore(Tile.Amulet);
  await screen.flash('You have found the Amulet of Yendor -- 25,000 points!');
  await screen.flash(
    'It seems that Kroz and Rogue share the same underground!)',
  );
  await screen.flash(
    'Your quest for the treasure of Kroz must still continue...',
  );
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
    case Tile.MBlock:
    case Tile.ZBlock:
    case Tile.GBlock: {
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
    case Tile.Wall:
    case Tile.Statue:
    case Tile.Rock:
    // TBD
    // eslint-disable-next-line no-fallthrough
    default:
      break;
  }
  screen.renderStats();
  await delay(10);
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
      state.score += state.level + 250;
      break;
    case Tile.Chance:
      state.score += 100;
      break;
    case Tile.Amulet:
      state.score += 2500;
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

export function getTimeScale() {
  if (state.T[Timer.SlowTime] > 0) return 0.1 * S; // Slow Time
  if (state.T[Timer.SpeedTime] > 0) return 100 * S; // Speed Time
  return S;
}

// TODO: Esc to reset (Are you sure?)
// TODO: P to pause/unpause (Press key to resume game)

function quit() {
  // TODO: Are you sure?
  state.done = true;
}

async function pause() {
  await screen.flash('Press any key to resume', false);
}

async function tabletMessage() {
  switch (state.levelId) {
    case LEVEL.DebugLevel:
    case LEVEL.LostLevel42:
      await prayer();
      await screen.flash(
        '"Barriers of water, like barriers in life, can always be..."',
      );

      for (let x = 0; x < XSize; x++) {
        for (let y = 0; y < YSize; y++) {
          if (state.PF[x][y] === Tile.River) {
            await sound.play(x * y, 50, 10);
            state.PF[x][y] = Tile.Block;
            drawTile(x, y);
          }
        }
      }

      await screen.flash('"...Overcome!"');

      break;
    default:
      break;
  }
}

async function prayer() {
  await screen.flash('On the Ancient Tablet is a short Mantra, a prayer...');
  await screen.flash('You take a deep breath and speak the words aloud...');
}
