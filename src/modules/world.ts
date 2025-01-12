import * as screen from './screen.ts';
import * as levels from './levels.ts';
import * as sound from './sound.ts';

import { CLOCK_SCALE, DEBUG, XMax, YMax } from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Level } from './levels.ts';
import { Type } from '../data/tiles.ts';
import { PlayField } from '../classes/map.ts';
import { RNG } from 'rot-js';

export const enum Timer {
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
  StatueGemDrain = 9,
}

const enum Difficulty {
  Novice = 8,
  Experienced = 5,
  Advanced = 2,
  Cheat = 9,
}

function getDefaultStats() {
  return {
    levelIndex: DEBUG ? 0 : 1,
    score: 0,
    gems: DEBUG ? 250 : 20,
    whips: DEBUG ? 100 : 0,
    teleports: DEBUG ? 50 : 0,
    keys: DEBUG ? 0 : 0,
    whipPower: DEBUG ? 3 : 2,
  };
}

function getDefaultLevelState() {
  return {
    bonus: 0, // Bonus count for K R O Z
    genNum: 0, // Number for creature generators
    magicEwalls: false, // Magic Ewalls
    evapoRate: 0, // Evaporation rate (TODO)
    treeRate: 0, // Tree rate (TODO)
    lavaRate: 0, // Lava rate (TODO)
    lavaFlow: false, // Lava flow (TODO)
    level: null as null | Level,
    player: new Entity(Type.Player),
    entities: [] as Entity[],
    map: new PlayField(),
    replacement: Type.Floor,
    T: [
      0,
      0,
      0,
      0,
      0, // 4 - Slow Time
      0, // 5 - Invisible
      0, // 6 - Speed Time
      0, // 7 - Freeze Time
      0,
      0,
    ], // Timers
    tabletMessage: undefined as undefined | (() => Promise<void>) | string,
  };
}

function getDefaultGameState() {
  return {
    difficulty: Difficulty.Novice,
    clockScale: CLOCK_SCALE,
    paused: false,
    done: false,
    foundSet: new Set<Type>() as Set<Type> | true,
  };
}

// These are store and restore when saving and loading
export const stats = getDefaultStats();

// These are reset when starting a new level
export const level = getDefaultLevelState();

// These are reset when starting a new game
export const game = getDefaultGameState();

const levelStartState = getDefaultStats();
const saveState = getDefaultStats();

export function resetState() {
  Object.assign(stats, getDefaultStats());
  Object.assign(level, getDefaultLevelState());
  Object.assign(game, getDefaultGameState());
}

export function resetLevel() {
  Object.assign(level, getDefaultLevelState());
}

export function storeLevelStartState() {
  Object.assign(levelStartState, stats);
}

export async function save() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to SAVE? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    // Don't need deep copy now, but might later
    Object.assign(saveState, levelStartState);
    localStorage.setItem('Kroz--saveState--v1', JSON.stringify(saveState));
  }
}

export async function restore() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage(
      'Are you sure you want to RESTORE? (Y/N)',
    );
  }

  if (answer.toLowerCase() === 'y') {
    let save = saveState;

    const value = localStorage.getItem('Kroz--saveState--v1');
    if (value) {
      try {
        save = JSON.parse(value);
      } catch (e) {
        console.error(e);
      }
    }

    Object.assign(stats, save);
    await levels.loadLevel();
  }
}

export function addScore(block: Type) {
  switch (block) {
    case Type.Border:
      if (stats.score > stats.levelIndex) stats.score -= stats.levelIndex / 2;
      break;
    case Type.Slow:
    case Type.Medium:
    case Type.Fast:
      stats.score += block;
      break;
    case Type.Block:
    case Type.ZBlock:
    case Type.GBlock:
    case Type.Wall:
    case Type.River:
    case Type.Tree:
    case Type.Forest:
    case Type.MBlock:
    case Type.OWall1:
    case Type.OWall2:
    case Type.OWall3:
    case Type.EWall:
      if (stats.score > 2) stats.score -= 2;
      break;
    case Type.Whip:
    case Type.SlowTime:
    case Type.Bomb:
      stats.score++;
      break;
    case Type.Stairs:
      stats.score += stats.levelIndex * 5;
      break;
    case Type.Chest:
      stats.score += 10 + Math.floor(stats.levelIndex / 2);
      break;
    case Type.Gem:
      stats.score += Math.floor(stats.levelIndex / 2) + 1;
      break;
    case Type.Invisible:
      stats.score += 25;
      break;
    case Type.Nugget:
      stats.score += 50;
      break;
    case Type.Door:
      stats.score += 10;
      break;
    case Type.Teleport:
    case Type.Freeze:
      stats.score += 2;
      break;
    case Type.SpeedTime:
    case Type.Power:
      stats.score += 5;
      break;
    case Type.Trap:
      if (stats.score > 5) stats.score -= 5;
      break;
    case Type.Lava:
      if (stats.score > 100) stats.score += 100;
      break;
    case Type.Tome:
      stats.score += 5000;
      break;
    case Type.Tablet:
      stats.score += stats.levelIndex + 250;
      break;
    case Type.Chance:
      stats.score += 100;
      break;
    case Type.Statue:
      stats.score += 10;
      break;
    case Type.Amulet:
      stats.score += 2500;
      break;
    case Type.Z:
      stats.score += 1000;
      break;
  }

  screen.renderStats();
}

export async function killAt(x: number, y: number) {
  const block = level.map.getType(x, y);

  level.map.setType(x, y, Type.Floor);

  if (block === Type.Slow || block === Type.Medium || block === Type.Fast) {
    for (let i = 0; i < level.entities.length; i++) {
      const m = level.entities[i];
      if (m.x === x && m.y === y) {
        await kill(m);
      }
    }
  }
}

export async function kill(e: Entity) {
  if (typeof e.type === 'number' && e.type < 4) {
    await sound.kill(e.type);
  }
  e.x = -1;
  e.y = -1;
}

export async function generateCreatures(n: number = 1) {
  for (let i = 0; i < n; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      if (level.map.getType(x, y) === Type.Floor) {
        level.entities.push(new Entity(Type.Slow, { x, y }));
        level.map.setType(x, y, Type.Slow);
        await sound.generateCreature();
        done = true;
      }

      screen.renderPlayfield();
    } while (!done && RNG.getUniformInt(0, 50) !== 0);
  }
}
