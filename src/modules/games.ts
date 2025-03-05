import { mod } from 'rot-js/lib/util';

import * as loading from '../data/loading/index.ts';
import * as debug from '../data/debug/index.ts';
import * as forgotten from '../data/forgotten/index.ts';
import * as kingdom from '../data/kingdom/index.ts';
import * as lost from '../data/lost/index.ts';
import * as caverns from '../data/caverns/index.ts';
import * as cruz from '../data/cruz/index.ts';
import * as procgen from '../data/proc-gen/index.ts';

import * as screen from './screen.ts';
import * as display from './display.ts';
import * as tiles from './tiles.ts';
import * as colors from './colors.ts';
import * as level from './levels.ts';
import * as world from './world.ts';
import * as controls from './controls.ts';

import type { Level } from './levels.ts';
import { readKrozJSON, readKrozTxt } from '../utils/kroz.ts';
import { isTiledMap, readLevelJSONLevel } from '../utils/tiled.ts';
import { ExternalTileset } from '@kayahr/tiled';
import { Color } from './colors.ts';

const k = kingdom.LEVELS.filter(Boolean).length;
const c = caverns.LEVELS.filter(Boolean).length;
const l = lost.LEVELS.filter(Boolean).length;
const z = cruz.LEVELS.filter(Boolean).length;

console.log(`Kingdom: ${k}, Caverns: ${c}, Lost: ${l}, Cruz: ${z}`);

export const END = Symbol('END');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LevelsArray = any[];

export interface Game {
  title: string;
  readTileset: () => Promise<ExternalTileset>;
  readColor: () => Promise<Record<string, string>>;
  findNextLevel: (i: number) => number | typeof END;
  findPrevLevel: (i: number) => number;
  readLevel: (i: number) => Promise<Level> | Level;
  start: () => Promise<void>;
}

export const enum Games {
  LOADING = 'loading',
  DEBUG = 'debug',
  FORGOTTEN = 'forgotten',
  KINGDOM = 'kingdom',
  LOST = 'lost',
  CAVERNS = 'caverns',
  CRUZ = 'cruz',
  PROC_GEN = 'procgen'
}

export const games = {
  [Games.LOADING]: loading,
  [Games.DEBUG]: debug,
  [Games.FORGOTTEN]: forgotten,
  [Games.KINGDOM]: kingdom,
  [Games.LOST]: lost,
  [Games.CAVERNS]: caverns,
  [Games.CRUZ]: cruz,
  [Games.PROC_GEN]: procgen
} satisfies Record<string, Partial<Game>>;

export async function loadGame(name: Games) {
  world.resetState();
  const game = (world.gameState.currentGame = addDefaults(games[name]));
  world.gameState.title = game.title;

  tiles.setTileset(await game.readTileset());
  colors.setColors(await game.readColor());

  display.clear(Color.Black);
  controls.flushAll();

  await game.start();

  await level.loadLevel(0);

  screen.fullRender();

  return game;
}

function addDefaults(game: Partial<Game> & { LEVELS?: LevelsArray }): Game {
  const _game = {
    title: '',
    readTileset,
    readColor,
    start,
    ...game
  } as Game;

  _game.findNextLevel ??= (i: number) => findNextLevel(game.LEVELS!, i);
  _game.findPrevLevel ??= (i: number) => findPrevLevel(game.LEVELS!, i);
  _game.readLevel ??= (i: number) => readLevel(game.LEVELS!, i);
  return _game;

  async function readTileset() {
    return (await import('../data/kroz.tileset.json')).default;
  }

  async function readColor() {
    return (await import('../data/kroz.colors.json')).default;
  }

  function findNextLevel(LEVELS: LevelsArray, i: number) {
    i++;
    while (!LEVELS[i] && i < LEVELS.length) {
      i++;
    }
    if (i >= LEVELS!.length) return END; // TODO: Move this to nextLevel effect??
    return i;
  }

  function findPrevLevel(LEVELS: LevelsArray, i: number) {
    do {
      i = mod(--i, LEVELS.length);
    } while (!LEVELS[i]);
    return i;
  }

  async function readLevel(LEVELS: LevelsArray, i: number): Promise<Level> {
    const levelData = await LEVELS[i]!();

    if (isTiledMap(levelData)) {
      return readLevelJSONLevel(levelData);
    } else if (typeof levelData === 'string') {
      return readKrozTxt(levelData);
    } else {
      return readKrozJSON(levelData);
    }
  }

  async function start() {
    await screen.introScreen();
    await screen.renderTitle();
  }
}
