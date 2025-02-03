import { default as RNG } from 'rot-js/lib/rng';
import * as tiled from '@kayahr/tiled';

import * as world from './world.ts';
import * as tiles from './tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as effects from './effects.ts';
import * as events from './events.ts';
import * as colors from './colors.ts';

import LEVELS from '../data/forgotton/index.ts';
// import LEVELS from '../data/kingdom/index.ts';
// import LEVELS from '../data/lost/index.ts';
// import LEVELS from '../data/caverns/index.ts';
// import LEVELS from '../data/cruz/index.ts';

import { mod } from 'rot-js/lib/util';
import { isGenerator, isMob, isPlayer } from '../classes/components.ts';
import { ensureObject } from '../utils/utils.ts';
import { XMax, YMax } from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Type } from './tiles.ts';
import { Timer } from './effects.ts';

export interface Level {
  id: string;
  data: Entity[];
  properties?: Record<string, unknown>;
  onLevelStart?: () => Promise<void>;
  startText?: string;
}

export { LEVELS };

export async function loadLevel() {
  world.resetLevel();

  const i = findNextLevel(world.stats.levelIndex);
  await tiles.readTileset(); // Reset tileset
  await colors.readColors(); // Reset colors
  const level = await readLevel(i);

  await level?.onLevelStart?.();
  world.storeLevelStartState();
  screen.fullRender();

  if (world.level.startText) {
    await effects.processEffect(world.level.startText, world.level.player);
  } else {
    await screen.flashMessage('Press any key to begin this level.');
  }
  events.levelStart.dispatch();
  controls.flushAll();
}

export function findNextLevel(i: number) {
  while (!LEVELS[i]) {
    i = mod(i + 1, LEVELS.length);
  }
  return i;
}

export async function setLevel(l: number) {
  const i = findNextLevel(l);
  world.stats.levelIndex = i;
  await loadLevel();
}

export async function nextLevel(dl: number = 1) {
  const i = findNextLevel(world.stats.levelIndex + dl);
  if (i % 10 === 0) {
    await screen.openSourceScreen();
  }

  world.stats.levelIndex = i;
  await loadLevel();
}

export async function prevLevel(dl: number = 1) {
  controls.flushAll();
  let i = world.stats.levelIndex - dl + 1;
  do {
    i = mod(i - 1, LEVELS.length);
  } while (!LEVELS[i]);

  world.stats.levelIndex = i;
  await loadLevel();
}

async function readLevel(i: number) {
  world.stats.levelIndex = i;

  const levelLoadPromise = LEVELS[world.stats.levelIndex]!;
  const levelData = await levelLoadPromise();
  const level = readLevelJSON(levelData as tiled.Map);
  world.level.startText = level!.startText;

  readLevelMapData(level.data);

  // Randomize gem and border colors
  await effects.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });
  world.level.borderFG = RNG.getUniformInt(8, 15);
  world.level.borderBG = RNG.getUniformInt(1, 8);

  screen.renderPlayfield();

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
      const { gid, x, y, height, width, properties, type } = obj;
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
          type ? +type : undefined,
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
      await effects.triggerEffect('HideGems', world.level.player);
    }
    if (properties.HideRocks) {
      await effects.triggerEffect('HideRocks', world.level.player);
    }
    if (properties.HideStairs) {
      await effects.triggerEffect('HideStairs', world.level.player);
    }
    if (properties.HideOpenWall) {
      await effects.triggerEffect('HideOpenWall', world.level.player);
    }
    if (properties.HideCreate) {
      await effects.triggerEffect('HideCreate', world.level.player);
    }
    if (properties.HideMBlock) {
      await effects.triggerEffect('HideMBlock', world.level.player);
    }
    if (properties.HideTrap) {
      await effects.triggerEffect('HideTrap', world.level.player);
    }
    if (properties.HideLevel) {
      await effects.triggerEffect('HideLevel', world.level.player);
    }
  }

  const startText =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.StartText ?? properties?.StartText ?? undefined;

  return {
    id: (properties?.id || '') as string,
    data,
    onLevelStart,
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
      if (entity.has(isMob)) {
        world.level.entities.push(entity);
      }
      if (entity.has(isGenerator)) {
        world.level.genNum++;
      }
    }
  }
}
