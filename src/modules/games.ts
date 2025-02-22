import { mod } from 'rot-js/lib/util';

import * as debug from '../data/debug/index.ts';
import * as forgotten from '../data/forgotten/index.ts';
import * as kingdom from '../data/kingdom/index.ts';
import * as lost from '../data/lost/index.ts';
import * as caverns from '../data/caverns/index.ts';
import * as cruz from '../data/cruz/index.ts';
import * as loading from '../data/loading/index.ts';
import * as procgen from '../data/proc-gen/index.ts';

import type { Level } from './levels.ts';
import { readRandomLevel } from '../utils/kroz.ts';
import { readLevelJSONLevel } from '../utils/tiled.ts';

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
  readTileset: () => Promise<unknown>;
  readColor: () => Promise<unknown>;
  findNextLevel: (i: number) => number | typeof END;
  findPrevLevel: (i: number) => number;
  readLevel: (i: number) => Promise<Level>;
}

export const games = {
  loading: addDefaults(loading),
  debug: addDefaults(debug),
  forgotten: addDefaults(forgotten),
  kingdom: addDefaults(kingdom),
  lost: addDefaults(lost),
  caverns: addDefaults(caverns),
  cruz: addDefaults(cruz),
  procgen: addDefaults(procgen)
} satisfies Record<string, Game>;

function addDefaults(game: Partial<Game> & { LEVELS?: LevelsArray }): Game {
  const _game = {
    title: '',
    readTileset,
    readColor,
    ...game
  } as Game;

  _game.findNextLevel ??= (i: number) => findNextLevel(game.LEVELS!, i);
  _game.findPrevLevel ??= (i: number) => findPrevLevel(game.LEVELS!, i);
  _game.readLevel ??= (i: number) => readLevel(game.LEVELS!, i);
  return _game;
}

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

  if (typeof levelData === 'string') {
    return readRandomLevel(levelData);
  } else {
    return readLevelJSONLevel(levelData);
  }
}
