import * as screen from './screen.ts';
import * as levels from './levels.ts';
import * as sound from './sound.ts';
import * as tiles from './tiles.ts';
import * as player from './player-system.ts';

import {
  CLOCK_SCALE,
  ENABLE_DEBUG_LEVEL,
  TITLE,
  XMax,
  YMax
} from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Level } from './levels.ts';
import { Type } from './tiles.ts';
import { PlayField } from '../classes/map.ts';
import { RNG } from 'rot-js';
import { Position } from '../classes/components.ts';

export const enum Difficulty {
  Novice = 8,
  Experienced = 5,
  Advanced = 2,
  Cheat = 9,
  Tourist = 10
}

function getDefaultStats() {
  return {
    levelIndex: ENABLE_DEBUG_LEVEL ? 0 : 1,
    score: 0,
    gems: 20,
    whips: 0,
    teleports: 0,
    keys: 0,
    whipPower: 2
  };
}

function getDefaultLevelState() {
  return {
    bonus: 0, // Bonus count for K R O Z
    genNum: 0, // Number for creature generators
    magicEWalls: false, // Magic Ewalls
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
      0
    ], // Timers
    startTrigger: undefined as undefined | string,
    borderFG: tiles.common.BORDER_FG,
    borderBG: tiles.common.BORDER_BG
  };
}

function getDefaultGameState() {
  return {
    difficulty: Difficulty.Novice,
    clockScale: CLOCK_SCALE,
    paused: false,
    started: false,
    done: false,
    foundSet: new Set<Type>() as Set<Type> | true,
    bot: false,
    title: TITLE
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
      'Are you sure you want to RESTORE? (Y/N)'
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

  setTypeAt(x, y, Type.Floor);
  screen.drawEntityAt(x, y);

  if (entity && entity.has(Position)) {
    await kill(entity);
  }
}

// Only works for base types, those defined in the tileset
export function setTypeAt(x: number, y: number, type: Type | string) {
  level.map.set(x, y, tiles.createEntityOfType(type, x, y));
}

export async function kill(e: Entity) {
  if (typeof e.type === 'number' && e.type < 4) {
    await sound.kill(e.type);
  }
  if (e.type === Type.Player) {
    player.dead();
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

export async function quit() {
  let answer = '';

  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n') {
    answer = await screen.flashMessage('Are you sure you want to quit? (Y/N)');
  }

  if (answer.toLowerCase() === 'y') {
    game.done = true;
  }
}

export async function pause() {
  game.paused = true;
  screen.fullRender();
  await screen.flashMessage('Press any key to resume');
}
