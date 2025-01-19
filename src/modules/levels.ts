import { default as RNG } from 'rot-js/lib/rng';

import * as world from './world.ts';
import * as tiles from '../data/tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as tiled from '@kayahr/tiled';

import FORGOTTEN from '../data/levels/forgotton.ts';
// import { LEVELS as KINGDOM } from '../data/levels/kingdom/index.ts';
// import { LEVELS as LOST } from '../data/levels/lost/index.ts';
// import { LEVELS as CAVERNS } from '../data/levels/caverns/index.ts';

import {
  createEntityOfType,
  TileIdLookup,
  Type,
  TypeColor,
} from '../data/tiles.ts';
import { Timer } from './world.ts';
import { mod } from 'rot-js/lib/util';
import {
  ChanceProbability,
  isGenerator,
  isChanced,
  isInvisible,
  isMobile,
  isPlayer,
  Position,
} from '../classes/components.ts';
import { ensureObject, tileIdToChar } from '../utils/utils.ts';
import { XMax, YMax } from '../data/constants.ts';

export interface Level {
  id: string;
  data: number[]; // TileIds
  properties?: Record<string, unknown>;
  onLevelStart?: () => Promise<void>;
  tabletMessage?: (() => Promise<void>) | string;
}

export const LEVELS = FORGOTTEN;

export async function loadLevel() {
  world.resetLevel();

  let i = world.stats.levelIndex;
  while (!LEVELS[i]) {
    i = mod(i + 1, LEVELS.length);
  }

  tiles.readTileset(); // Reset tileset

  const levelLoadPromise = LEVELS[(world.stats.levelIndex = i)];
  const level = (await levelLoadPromise()) as Level;
  world.level.tabletMessage = level!.tabletMessage;

  readLevelMapData(level.data);

  // Randomize gem and border colors
  world.level.map.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });
  TypeColor[Type.Border] = [RNG.getUniformInt(8, 15), RNG.getUniformInt(1, 8)];

  level?.onLevelStart?.();
  world.storeLevelStartState();
  screen.fullRender();
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
  await screen.flashMessage('Press any key to begin this level.');
}

export async function prevLevel() {
  controls.flushAll();
  let i = world.stats.levelIndex;
  do {
    i = mod(i - 1, LEVELS.length);
  } while (!LEVELS[i]);

  world.stats.levelIndex = i;
  await loadLevel();
  await screen.flashMessage('Press any key to begin this level.');
}

export function readLevelJSON(tilemap: tiled.Map): Level {
  const { layers, properties: _properties } = tilemap;
  const properties = ensureObject(_properties);

  // TODO:
  // verify encoding and/or compression

  const data = [];
  for (const layer of layers) {
    // Collapse layers
    let layerData;
    if (tiled.isEncodedTileLayer(layer)) {
      layerData = tiled.decodeTileLayer(layer).data;
    } else if (tiled.isUnencodedTileLayer(layer)) {
      layerData = layer.data;
    } else {
      throw new Error('Unsupported layer encoding');
    }

    if (layerData) {
      for (let i = 0; i < layerData.length; i++) {
        const tileId = +layerData[i] - 1;
        if (tileId > -1) {
          data[i] = tileId;
        }
      }
    }
  }

  async function onLevelStart() {
    if (!properties) return;

    world.level.magicEwalls = properties.MagicEWalls ?? false;
    world.level.evapoRate = properties.EvapoRate ?? 0;
    world.level.treeRate = properties.TreeRate ?? 0;
    world.level.lavaRate = properties.LavaRate ?? 0;
    world.level.lavaFlow = properties.LavaFlow ?? false;

    console.log(world.level, properties);

    if (properties.HideGems) {
      world.level.map.hideType(Type.Gem);
    }
    if (properties.HideRocks) {
      world.level.map.hideType(Type.Rock);
    }
    if (properties.HideStairs) {
      world.level.map.hideType(Type.Stairs);
    }
    if (properties.HideOpenWall) {
      // be careful with this one, name is confusing
      // hides the open wall spell, not the wall itself
      world.level.map.hideType(Type.OSpell1);
      world.level.map.hideType(Type.OSpell2);
      world.level.map.hideType(Type.OSpell3);
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
      for (let x = 0; x < world.level.map.width; x++) {
        for (let y = 0; y < world.level.map.height; y++) {
          const e = world.level.map.get(x, y)!;
          if (e && !e.has(isPlayer)) {
            e.add(isInvisible);
          }
        }
      }
    }
  }

  return {
    id: (properties?.id || '') as string,
    data,
    onLevelStart,
    tabletMessage: properties?.tabletMessage as string,
    properties,
  };
}

function readLevelMapData(data: number[]) {
  const map = world.level.map;

  let i = 0;
  for (let y = 0; y <= YMax; y++) {
    for (let x = 0; x <= XMax; x++) {
      const tileId = data[i++];
      const type = TileIdLookup[tileId] ?? tileIdToChar(tileId) ?? 0;
      const entity = createEntityOfType(type);
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
          entity.remove(ChanceProbability);
          entity.add(isChanced);
        }
      }
    }
  }
}
