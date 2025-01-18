import { default as RNG } from 'rot-js/lib/rng';

import * as world from './world.ts';
import * as tiles from '../data/tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';

import FORGOTTEN from '../data/levels/forgotton.ts';
// import { LEVELS as KINGDOM } from '../data/levels/kingdom/index.ts';
// import { LEVELS as LOST } from '../data/levels/lost/index.ts';
// import { LEVELS as CAVERNS } from '../data/levels/caverns/index.ts';

import {
  createEntityOfType,
  MapLookup,
  Type,
  TypeChar,
  TypeColor,
} from '../data/tiles.ts';
import { FLOOR_CHAR, XMax, YMax } from '../data/constants.ts';
import { Timer } from './world.ts';
import { mod } from 'rot-js/lib/util';
import {
  ChanceProbability,
  isGenerator,
  isInvisible,
  isMobile,
  isPlayer,
  Position,
  Renderable,
} from '../classes/components.ts';
import { tileIdToChar } from '../utils/utils.ts';

export interface Level {
  id: string;
  map: string;
  name?: string;
  onLevelStart?: () => Promise<void>;
  tabletMessage?: (() => Promise<void>) | string;
}

export const LEVELS: Array<null | Level> = FORGOTTEN as Array<null | Level>;

function readLevelMap(level: string) {
  const map = world.level.map;

  const lines = level.split('\n').filter((line) => line.length > 0);
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const char = line.charAt(x) ?? FLOOR_CHAR;
      const block = MapLookup[char];

      const entity = createEntityOfType(block ?? char);
      map.set(x, y, entity);

      if (entity.type === Type.Statue) {
        world.level.T[Timer.StatueGemDrain] = 32000;
      }
      if (entity.has(isPlayer)) {
        entity.add(new Position({ x, y }));
        world.level.player = entity;
      }
      if (entity.has(isMobile)) {
        entity.add(new Position({ x, y }));
        world.level.entities.push(entity);
      }
      if (entity.has(isGenerator)) {
        world.level.genNum++;
      }

      // TODO: item becomes visible once whipped
      if (entity.has(ChanceProbability)) {
        const p = entity.get(ChanceProbability)!.probability;
        if (Math.random() < p) {
          const t = entity.get(Renderable)!;
          t.ch = TypeChar[Type.Chance];
          t.fg = TypeColor[Type.Chance][0] ?? TypeColor[Type.Floor][0];
          t.bg = TypeColor[Type.Chance][1] ?? TypeColor[Type.Floor][1];
        }
      }
    }
  }

  // Randomize gem colors
  map.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });

  // Randomize
  TypeColor[Type.Border] = [RNG.getUniformInt(8, 15), RNG.getUniformInt(1, 8)];
}

export async function loadLevel() {
  world.resetLevel();

  let i = world.stats.levelIndex;
  while (!LEVELS[i]) {
    i = mod(i + 1, LEVELS.length);
  }

  const level = LEVELS[world.stats.levelIndex = i];
  world.level.tabletMessage = level!.tabletMessage;
  tiles.reset();
  readLevelMap(level!.map);
  level?.onLevelStart?.();
  world.storeLevelStartState();
  screen.fullRender();
  await screen.flashMessage('Press any key to begin this level.');
}

export async function nextLevel() {
  // https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST5.MOV#L377C19-L377C72 ??
  controls.flushAll();
  let i = world.stats.levelIndex;
  do {
    i = mod(i + 1, LEVELS.length);
  } while (!LEVELS[i]);

  if (i % 10 === 0) {
    await screen.openSourceScreen();
  }

  world.stats.levelIndex = i;
  await loadLevel();
}

export async function prevLevel() {
  controls.flushAll();
  let i = world.stats.levelIndex;
  do {
    i = mod(i - 1, LEVELS.length);
  } while (!LEVELS[i]);

  world.stats.levelIndex = i;
  await loadLevel();
}

// TODO: rewrite this so it doesn't need to go through tileIdToChar

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readLevelJSON(tilemap: any): Level {
  const { layers, properties } = tilemap;
  const { height, width, data } = layers[0];

  // TODO:
  // verify encoding and/or compression

  let map = '';
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileId = data[i++] - 1;
      const char = tileIdToChar(tileId);
      map += char;
    }
    map += '\n';
  }

  async function onLevelStart() {
    if (properties.HideGems) {
      world.level.map.hideType(Type.Gem);
    }
    if (properties.HideStairs) {
      world.level.map.hideType(Type.Stairs);
    }
    if (properties.HideOpenWall) {
      world.level.map.hideType(Type.OWall1);
      world.level.map.hideType(Type.OWall2);
      world.level.map.hideType(Type.OWall3);
    }
    if (properties.HideCreate) {
      world.level.map.hideType(Type.Create);
    }
    if (properties.HideMBlock) {
      world.level.map.hideType(Type.MBlock);
    }
    if (properties.HideTrap) {
      world.level.map.hideType(Type.Trap);
    }
    if (properties.HideLevel) {
      for (let x = 0; x <= XMax; x++) {
        for (let y = 0; y <= YMax; y++) {
          const e = world.level.map.get(x, y)!;
          if (e && !e.has(isPlayer)) {
            e.add(isInvisible);
          }
        }
      }
    }
  }

  return {
    map,
    onLevelStart,
    ...properties
  } as Level;
}