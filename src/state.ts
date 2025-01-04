import { DEBUG } from './constants';
import { Entity } from './entities';
import { Level } from './levels';
import { Tile } from './tiles';

export const enum Timer {
  SlowTime = 4,
  Invisible = 5,
  SpeedTime = 6,
  FreezeTime = 7,
}

const enum Difficulty {
  Novice = 8,
  Experienced = 5,
  Advanced = 2,
  Cheat = 9,
}

export const state = getDefaultState();

const levelStartState = {} as typeof state;
const saveState = {} as typeof state;

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
    bonus: 0,

    difficulty: Difficulty.Novice,

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

export function storeLevelStartState() {
  Object.assign(levelStartState, state);
}

export function saveLevelStartState() {
  // Don't need deep copy now, but might later
  Object.assign(saveState, levelStartState);
}

export function restoreLevelStartState() {
  Object.assign(state, saveState);
}
