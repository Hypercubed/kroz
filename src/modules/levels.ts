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
import { ensureObject, getASCIICode } from '../utils/utils.ts';
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

let LEVELS = [] as Array<(() => Promise<tiled.Map | string>) | null>;

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

  const data = await LEVELS[world.stats.levelIndex]!();
  const level =
    typeof data === 'string'
      ? readRandomLevel(data)
      : readLevelJSONLevel(data as tiled.Map);
  await loadLevelData(level);
  screen.renderPlayfield();
  screen.renderBorder();

  return level;
}

function readRandomLevel(levelData: string): Level {
  const data: Entity[] = [];
  let tileKeys = '';
  const lines = levelData.split('\n');

  for (let y = 0; y < lines.length; y++) {
    const keys = lines[y];
    const counts = lines[++y];

    for (let i = 0; i < keys.length; i += 3) {
      const key = keys.substring(i, i + 3).trim();
      const count = key === 'P' ? 1 : +counts.substring(i, i + 3);
      tileKeys += key.repeat(count);
    }
  }

  const width = XMax + 1;
  const height = YMax + 1;
  const size = width * height;
  if (tileKeys.length < size) {
    tileKeys += ' '.repeat(size - tileKeys.length);
  }

  const tileArray = shuffle(tileKeys.split(''));

  for (let i = 0; i < size; i++) {
    const tileId = getASCIICode(tileArray[i]);
    const x = i % width;
    const y = Math.floor(i / width);
    data[i] = tiles.createEntityFromTileId(tileId, x, y);
  }

  return {
    id: '',
    data,
    startTrigger: undefined,
    properties: {}
  };
}

// Reads the level data from a Tiled JSON file into a Level object
function readLevelJSONLevel(tilemap: tiled.Map): Level {
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

// Reads the level data into the world
async function loadLevelData(level: Level) {
  const { data, startTrigger } = level;

  world.level.startTrigger = startTrigger;

  const map = world.level.map;

  let i = 0;

  map.fill(() => data[i++]);

  map.forEach((_x, _y, entity) => {
    if (!entity) return;
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
  });

  // Randomize gem and border colors
  await effects.updateTilesByType(Type.Gem, { fg: RNG.getUniformInt(1, 15) });
  world.level.borderFG = RNG.getUniformInt(8, 15);
  world.level.borderBG = RNG.getUniformInt(1, 8);
}

function getTileIdFromGID(gid: number): number {
  if (!gid || gid < 0) return -1;
  return (+gid % 256) - 1;
}

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }

  return array;
}
