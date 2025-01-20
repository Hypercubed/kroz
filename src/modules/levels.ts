import { default as RNG } from 'rot-js/lib/rng';

import * as world from './world.ts';
import * as tiles from '../data/tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as tiled from '@kayahr/tiled';
import * as effects from './effects.ts';

import LEVELS from '../data/levels/forgotton/index.ts';
// import LEVELS from '../data/levels/kingdom/index.ts';
// import LEVELS from '../data/levels/lost/index.ts';
// import LEVELS from '../data/levels/caverns/index.ts';

import { mod } from 'rot-js/lib/util';
import { isGenerator, isMobile, isPlayer } from '../classes/components.ts';
import { ensureObject } from '../utils/utils.ts';
import { XMax, YMax } from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Type, TypeColor } from '../data/tiles.ts';
import { Timer } from './effects.ts';

export interface Level {
  id: string;
  data: Entity[];
  properties?: Record<string, unknown>;
  onLevelStart?: () => Promise<void>;
  tabletMessage?: string;
  startText?: string;
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

  await level?.onLevelStart?.();
  world.storeLevelStartState();
  screen.fullRender();

  if (world.level.startText) {
    await effects.readMessage(world.level.startText);
  } else {
    await screen.flashMessage('Press any key to begin this level.');
  }
  controls.flushAll();
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

async function readLevel(i: number) {
  world.stats.levelIndex = i;

  const levelLoadPromise = LEVELS[world.stats.levelIndex];
  const levelData = await levelLoadPromise();
  const level = readLevelJSON(levelData as tiled.Map);
  world.level.tabletMessage = level!.tabletMessage;
  world.level.startText = level!.startText;

  readLevelMapData(level.data);

  // Randomize gem and border colors
  effects.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });
  TypeColor[Type.Border] = [RNG.getUniformInt(8, 15), RNG.getUniformInt(1, 8)];

  return level;
}

// const LEVEL_START_TRIGGERS = {
//   HideGems: () => effects.specialTriggers('HideGems'),
//   HideRocks: () => effects.specialTriggers('HideRocks'),
//   HideStairs: () => effects.specialTriggers('HideStairs'),
//   HideOpenWall: () => effects.specialTriggers('HideOpenWall'),
//   HideCreate: () => effects.specialTriggers('HideCreate'),
//   HideMBlock: () => effects.specialTriggers('HideMBlock'),
//   HideTrap: () => effects.specialTriggers('HideTrap'),
//   HideLevel: () => effects.specialTriggers('HideLevel'),
// }

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
      if (!gid || x < 0 || y < 0 || !height || !width) continue;
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
      await effects.specialTriggers('HideGems');
    }
    if (properties.HideRocks) {
      await effects.specialTriggers('HideRocks');
    }
    if (properties.HideStairs) {
      await effects.specialTriggers('HideStairs');
    }
    if (properties.HideOpenWall) {
      await effects.specialTriggers('HideOpenWall');
    }
    if (properties.HideCreate) {
      await effects.specialTriggers('HideCreate');
    }
    if (properties.HideMBlock) {
      await effects.specialTriggers('HideMBlock');
    }
    if (properties.HideTrap) {
      await effects.specialTriggers('HideTrap');
    }
    if (properties.HideLevel) {
      await effects.specialTriggers('HideLevel');
    }
  }

  // TODO: Make map an entity, add these to the map?
  const tabletMessage =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.tabletMessage ?? properties?.tabletMessage ?? undefined;

  const startText =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.StartText ?? properties?.StartText ?? undefined;

  return {
    id: (properties?.id || '') as string,
    data,
    onLevelStart,
    tabletMessage,
    startText,
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
