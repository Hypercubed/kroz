import { default as RNG } from 'rot-js/lib/rng';

import * as world from './world.ts';
import * as tiles from '../data/tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as tiled from '@kayahr/tiled';

import LEVELS from '../data/levels/forgotton.ts';
// import LEVELS from '../data/levels/kingdom/index.ts';
// import LEVELS from '../data/levels/lost/index.ts';
// import LEVELS from '../data/levels/caverns/index.ts';

import { Timer } from './world.ts';
import { mod } from 'rot-js/lib/util';
import {
  isGenerator,
  isInvisible,
  isMobile,
  isPlayer,
} from '../classes/components.ts';
import { ensureObject } from '../utils/utils.ts';
import { XMax, YMax } from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Type, TypeColor } from '../data/tiles.ts';

export interface Level {
  id: string;
  data: Entity[];
  properties?: Record<string, unknown>;
  onLevelStart?: () => Promise<void>;
  tabletMessage?: (() => Promise<void>) | string;
}

export { LEVELS };

export async function loadLevel() {
  world.resetLevel();

  let i = world.stats.levelIndex;
  while (!LEVELS[i]) {
    i = mod(i + 1, LEVELS.length);
  }

  tiles.readTileset(); // Reset tileset
  const level = await readLevel(i);

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

async function readLevel(i: number) {
  world.stats.levelIndex = i;

  const levelLoadPromise = LEVELS[world.stats.levelIndex];
  const levelData = await levelLoadPromise();
  const level = readLevelJSON(levelData as tiled.Map);
  world.level.tabletMessage = level!.tabletMessage;

  readLevelMapData(level.data);

  // Randomize gem and border colors
  world.level.map.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });
  TypeColor[Type.Border] = [RNG.getUniformInt(8, 15), RNG.getUniformInt(1, 8)];

  return level;
}

// Reads the level data from a Tiled JSON file into a Level object
function readLevelJSON(tilemap: tiled.Map): Level {
  const { layers, properties: _properties } = tilemap;
  const properties = ensureObject(_properties);

  const data: Entity[] = [];
  for (const layer of layers) {
    // Collapse layers
    // TODO: Combine layers?
    if (tiled.isEncodedTileLayer(layer)) {
      readUnencodedTileLayer(tiled.decodeTileLayer(layer), data);
    } else if (tiled.isUnencodedTileLayer(layer)) {
      readUnencodedTileLayer(layer, data);
    } else if (tiled.isObjectGroup(layer)) {
      readObjectGroup(layer, data);
    } else {
      throw new Error('Unsupported layer encoding');
    }
  }

  function readObjectGroup(layer: tiled.ObjectGroup, output: Entity[]) {
    for (const obj of layer.objects) {
      const { gid, x, y, height, width, properties } = obj;
      if (!gid || !x || !y || !height || !width) continue;
      const tileId = tiles.getTileIdFromGID(obj.gid!);
      if (tileId > -1) {
        const xx = x / width;
        const yy = y / height - 1;
        output[yy * tilemap.width + xx] = tiles.createEntityFromTileId(
          tileId,
          xx,
          yy,
          ensureObject(properties),
        );
      }
    }

    return output;
  }

  function readUnencodedTileLayer(
    layer: tiled.UnencodedTileLayer,
    output: Entity[],
  ) {
    const { data } = layer;
    if (!data) return output;

    for (let i = 0; i < data.length; i++) {
      const tileId = tiles.getTileIdFromGID(+data[i]);
      if (tileId > -1) {
        const x = i % tilemap.width;
        const y = Math.floor(i / tilemap.width);
        output[i] = tiles.createEntityFromTileId(tileId, x, y);
      }
    }
    return output;
  }

  async function onLevelStart() {
    if ('onLevelStart' in tilemap) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await tilemap.onLevelStart();
    }

    if (!properties) return;

    world.level.magicEwalls = properties.MagicEWalls ?? false;
    world.level.evapoRate = properties.EvapoRate ?? 0;
    world.level.treeRate = properties.TreeRate ?? 0;
    world.level.lavaRate = properties.LavaRate ?? 0;
    world.level.lavaFlow = properties.LavaFlow ?? false;

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

  const tabletMessage =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.tabletMessage ?? properties?.tabletMessage ?? undefined;

  return {
    id: (properties?.id || '') as string,
    data,
    onLevelStart,
    tabletMessage,
    properties,
  };
}

// Reads the level data into the world
function readLevelMapData(data: Entity[]) {
  const map = world.level.map;

  let i = 0;
  for (let y = 0; y <= YMax; y++) {
    for (let x = 0; x <= XMax; x++) {
      const entity = data[i++];
      map.set(x, y, entity);
    }
  }

  for (let y = 0; y <= YMax; y++) {
    for (let x = 0; x <= XMax; x++) {
      const entity = map.get(x, y);
      if (!entity) continue;
      if (entity.type === Type.Statue) {
        world.level.T[Timer.StatueGemDrain] = 32000;
      }
      if (entity.has(isPlayer)) {
        world.level.player = entity;
      }
      if (entity.has(isMobile)) {
        world.level.entities.push(entity);
      }
      if (entity.has(isGenerator)) {
        world.level.genNum++;
      }
    }
  }
}
