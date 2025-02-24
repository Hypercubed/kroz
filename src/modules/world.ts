import * as screen from './screen.ts';
import * as levels from './levels.ts';
import * as sound from './sound.ts';
import * as tiles from './tiles.ts';
import * as player from '../systems/player-system.ts';

import { CLOCK_SCALE, TITLE, XMax, YMax } from '../constants/constants.ts';
import { Entity } from '../classes/entity.ts';
import { type Level } from './levels.ts';
import { PlayField } from '../classes/map.ts';
import { RNG } from 'rot-js';
import {
  isGenerator,
  isMob,
  isPlayer,
  Position
} from '../classes/components.ts';
import { Type } from '../constants/types.ts';
import { Timer } from './effects.ts';
import { type Game } from './games.ts';

export const enum Difficulty {
  Novice = 8,
  Experienced = 5,
  Advanced = 2,
  Cheat = 9,
  Tourist = 10
}

function getDefaultStats() {
  return {
    levelIndex: 1,
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
    currentLevel: null as null | Level,
    bonus: 0, // Bonus count for K R O Z
    genNum: 0, // Number for creature generators
    magicEWalls: false, // Magic Ewalls
    evapoRate: 0, // Evaporation rate (TODO)
    treeRate: 0, // Tree rate (TODO)
    lavaRate: 0, // Lava rate (TODO)
    lavaFlow: false, // Lava flow (TODO)
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
    currentGame: null as null | Game,
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
export const levelState = getDefaultLevelState();

// These are reset when starting a new game
export const gameState = getDefaultGameState();

const levelStartState = getDefaultStats();
const saveState = getDefaultStats();

export function resetState() {
  Object.assign(stats, getDefaultStats());
  Object.assign(levelState, getDefaultLevelState());
  Object.assign(gameState, getDefaultGameState());
}

export function resetLevel() {
  Object.assign(levelState, getDefaultLevelState());
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
    await levels.loadLevel(stats.levelIndex);
  }
}

export async function restartLevel() {
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
    Object.assign(stats, levelStartState);
    await levels.loadLevel(stats.levelIndex);
  }
}

export function addScore(block: Type) {
  stats.score += tiles.getScoreDelta(block);
  screen.renderStats();
}

export async function killAt(x: number, y: number) {
  const entity = levelState.map.get(x, y);

  setTypeAt(x, y, Type.Floor);
  screen.drawEntityAt(x, y);

  if (entity && entity.has(Position)) {
    await kill(entity);
  }
}

// Only works for base types, those defined in the tileset
export function setTypeAt(x: number, y: number, type: Type | string) {
  levelState.map.set(x, y, tiles.createEntityOfType(type, x, y));
}

export async function kill(e: Entity) {
  if (typeof e.type === 'number' && e.type < 4) {
    await sound.kill(e.type);
    e.get(Position)?.die();
  }
  if (e.type === Type.Player) {
    await player.dead();
  }
}

// Move to effects??
export async function generateCreatures(n: number = 1) {
  for (let i = 0; i < n; i++) {
    let done = false;
    do {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      if (levelState.map.getType(x, y) === Type.Floor) {
        const entity = tiles.createEntityOfType(Type.Slow, x, y);
        levelState.entities.push(entity);
        levelState.map.set(x, y, entity);
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
    gameState.done = true;
  }
}

export async function pause() {
  gameState.paused = true;
  screen.fullRender();
  await screen.flashMessage('Press any key to resume');
}

// TODO: Call this when entities are changed
export async function reindexMap() {
  levelState.genNum = 0;
  levelState.entities = [];
  levelState.T[Timer.StatueGemDrain] = 0;

  await levelState.map.forEach(async (_x, _y, entity) => {
    if (!entity) return;
    if (entity.type === Type.Statue) {
      levelState.T[Timer.StatueGemDrain] = 32000;
    }
    if (entity.has(isPlayer)) {
      levelState.player = entity;
    }
    if (entity.has(isMob)) {
      levelState.entities.push(entity);
    }
    if (entity.has(isGenerator)) {
      levelState.genNum++;
    }
  });
}
