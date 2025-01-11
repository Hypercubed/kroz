import * as screen from '../modules/screen.ts';
import * as levels from '../modules/levels.ts';

import { CLOCK_SCALE, DEBUG } from '../data/constants.ts';
import { Actor } from '../classes/actors.ts';
import { Level } from './levels';
import { Type } from '../data/tiles.ts';
import { PlayField } from '../classes/map.ts';

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
    player: new Actor(Type.Player, 0, 0),
    entities: [] as Actor[],
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
