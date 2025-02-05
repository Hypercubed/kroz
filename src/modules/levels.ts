import { default as RNG } from 'rot-js/lib/rng';
import * as tiled from '@kayahr/tiled';

import * as world from './world.ts';
import * as tiles from './tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as effects from './effects.ts';
import * as events from './events.ts';

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
  startTrigger?: string;
}

let LEVELS = [] as Array<(() => Promise<tiled.Map>) | null>;

export function addLevels(levels: typeof LEVELS) {
  LEVELS = levels;
}

export function getLevelsCount() {
  return LEVELS.length;
}

export async function loadLevel() {
  world.resetLevel();

  const i = findNextLevel(world.stats.levelIndex);
  await readLevel(i);

  world.storeLevelStartState();
  screen.fullRender();

  if (world.level.startTrigger) {
    await effects.processEffect(world.level.startTrigger);
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
  world.level.startTrigger = level!.startTrigger;

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
      if (gid > 0) {
        const tileId = getTileIdFromGID(obj.gid!);
        const xx = x / width;
        const yy = y / height - 1;
        output[yy * tilemap.width + xx] = tiles.createEntityFromTileId(
          tileId,
          xx,
          yy,
          ensureObject(properties),
          type
        );
      }
    }

    return output;
  }

  function readUnencodedTileLayer(
    layer: tiled.UnencodedTileLayer,
    output: Entity[]
  ) {
    const { data } = layer;
    if (!data) return output;

    for (let i = 0; i < data.length; i++) {
      const tileId = getTileIdFromGID(+data[i]);
      if (tileId > -1) {
        const x = i % tilemap.width;
        const y = Math.floor(i / tilemap.width);
        output[i] = tiles.createEntityFromTileId(tileId, x, y);
      }
    }
    return output;
  }

  const startTrigger =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.StartTrigger ?? properties?.StartTrigger ?? undefined;

  return {
    id: (properties?.id || '') as string,
    data,
    startTrigger,
    properties
  };
}

function getTileIdFromGID(gid: number): number {
  if (!gid || gid < 0) return -1;
  return (+gid % 256) - 1;
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
