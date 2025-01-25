import * as screen from './screen.ts';
import * as levels from './levels.ts';
import * as sound from './sound.ts';
import * as tiles from '../data/tiles.ts';

import { CLOCK_SCALE, DEBUG, XMax, YMax } from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Level } from './levels.ts';
import { Type } from '../data/tiles.ts';
import { PlayField } from '../classes/map.ts';
import { RNG } from 'rot-js';
import { Position } from '../classes/components.ts';

export const enum Difficulty {
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
    entities: [] as Entity[], // TODO: create sets by class
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
    startText: undefined as undefined | string,
  };
}

function getDefaultGameState() {
  return {
    difficulty: Difficulty.Novice,
    clockScale: CLOCK_SCALE,
    paused: false,
    done: false,
    foundSet: new Set<Type>() as Set<Type> | true,
    bot: false,
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

  while (
    answer.toLowerCase() !== 'y' &&
    answer.toLowerCase() !== 'n' &&
    answer.toLowerCase() !== 'w' &&
    answer.toLowerCase() !== 't'
  ) {
    answer = await screen.flashMessage('Are you sure you want to SAVE? (Y/N)');
  }

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'w') {
    // Don't need deep copy now, but might later
    Object.assign(saveState, levelStartState);
    localStorage.setItem('Kroz--saveState--v1', JSON.stringify(saveState));
  }
}

export async function restore() {
  let answer = '';

  while (
    answer.toLowerCase() !== 'y' &&
    answer.toLowerCase() !== 'n' &&
    answer.toLowerCase() !== 'w' &&
    answer.toLowerCase() !== 't'
  ) {
    answer = await screen.flashMessage(
      'Are you sure you want to RESTORE? (Y/N)',
    );
  }

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'w') {
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
  stats.score += tiles.getScoreDelta(block);
  screen.renderStats();
}

export async function killAt(x: number, y: number) {
  const entity = level.map.get(x, y);

  level.map.setType(x, y, Type.Floor);
  screen.drawEntity(x, y);

  if (entity && entity.has(Position)) {
    await kill(entity);
  }
}

export async function kill(e: Entity) {
  if (typeof e.type === 'number' && e.type < 4) {
    await sound.kill(e.type);
  }
  e.get(Position)?.die();
}

export async function generateCreatures(n: number = 1) {
  for (let i = 0; i < n; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      if (level.map.getType(x, y) === Type.Floor) {
        const entity = tiles.createEntityOfType(Type.Slow, x, y);
        level.entities.push(entity);
        level.map.set(x, y, entity);
        await sound.generateCreature();
        done = true;
      }

      screen.renderPlayfield();
    } while (!done && RNG.getUniformInt(0, 50) !== 0);
  }
}
