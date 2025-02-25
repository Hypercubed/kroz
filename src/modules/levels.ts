import { default as RNG } from 'rot-js/lib/rng';

import * as world from './world.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as effects from './effects.ts';
import * as events from './events.ts';
import * as scripts from './scripts.ts';
import * as tiles from './tiles.ts';

import { SHOW_OPENSOURCE_SCREEN } from '../constants/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Type } from '../constants/types.ts';
import { END } from './games.ts';

export interface Level {
  id: string;
  data: Entity[];
  properties?: Record<string, unknown>;
  startTrigger?: string;
}

export async function loadLevel(i: number = world.stats.levelIndex ?? 1) {
  controls.flushAll();
  world.resetLevel();
  await readLevel(i);

  world.storeLevelStartState();
  screen.fullRender();

  if (world.levelState.startTrigger) {
    await scripts.processEffect(world.levelState.startTrigger);
  } else {
    await screen.flashMessage('Press any key to begin this level.');
  }
  events.levelStart.dispatch();
  controls.flushAll();
}

export async function nextLevel() {
  const i = world.gameState.currentGame!.findNextLevel(world.stats.levelIndex);
  if (i === END) {
    world.gameState.done = true;
    await screen.endRoutine();
    return;
  }
  if (SHOW_OPENSOURCE_SCREEN && typeof i === 'number' && i % 10 === 0) {
    await screen.openSourceScreen();
  }
  await loadLevel(i);
}

export async function prevLevel() {
  const i = world.gameState.currentGame!.findPrevLevel(world.stats.levelIndex);
  await loadLevel(i);
}

async function readLevel(i: number) {
  world.stats.levelIndex = i;
  const level = await world.gameState.currentGame!.readLevel(i);

  await loadLevelData(level);

  screen.renderPlayfield();
  screen.renderBorder();
}

// Reads the level data into the world
async function loadLevelData(level: Level) {
  const { data, startTrigger } = level;

  world.levelState.startTrigger = startTrigger;
  world.levelState.map.fill((_x, _y, i) => data[i]);
  await world.reindexMap();

  // Randomize gem and border colors
  await effects.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });
  tiles.common.BORDER_FG = RNG.getUniformInt(8, 15);
  tiles.common.BORDER_BG = RNG.getUniformInt(1, 8);
}
