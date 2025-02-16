import { default as RNG } from 'rot-js/lib/rng';
import * as tiled from '@kayahr/tiled';

import * as world from './world.ts';
import * as tiles from './tiles.ts';
import * as controls from './controls.ts';
import * as screen from './screen.ts';
import * as effects from './effects.ts';
import * as events from './events.ts';

import { mod } from 'rot-js/lib/util';
import {
  isGenerator,
  isMob,
  isPlayer,
  Renderable
} from '../classes/components.ts';
import {
  ensureObject,
  getASCIICode,
  shuffle,
  wrapString
} from '../utils/utils.ts';
import { XMax, YMax } from '../data/constants.ts';
import { Entity } from '../classes/entity.ts';
import { Type } from './tiles.ts';
import { Timer } from './effects.ts';
import { Color } from './colors.ts';

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

  const levelData = await LEVELS[world.stats.levelIndex]!();

  let level: Level;
  if (typeof levelData === 'string') {
    level = readRandomLevel(levelData);
  } else {
    level = readLevelJSONLevel(levelData);
  }

  await loadLevelData(level);

  screen.renderPlayfield();
  screen.renderBorder();
}

function readRandomLevel(levelData: string): Level {
  const data: Entity[] = [];
  let tileKeys = processDF(levelData);

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
  const output: Entity[] = [];
  const { layers, properties: _properties } = tilemap;
  const properties = ensureObject(_properties);

  for (const layer of layers) {
    // Collapse layers
    // TODO: Combine layers?
    if (tiled.isEncodedTileLayer(layer)) {
      readUnencodedTileLayer(tiled.decodeTileLayer(layer));
    } else if (tiled.isUnencodedTileLayer(layer)) {
      readUnencodedTileLayer(layer);
    } else if (tiled.isObjectGroup(layer)) {
      readObjectGroup(layer);
    } else {
      throw new Error('Unsupported layer encoding');
    }
  }

  if (properties && 'DF' in properties) {
    addRandomData(properties.DF);
  }

  const startTrigger =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tilemap.StartTrigger ?? properties?.StartTrigger ?? undefined;

  return {
    id: (properties?.id || '') as string,
    data: output,
    startTrigger,
    properties
  };

  function readObjectGroup(layer: tiled.ObjectGroup) {
    for (const obj of layer.objects) {
      if (obj.text) {
        readTextObject(obj);
        continue;
      }

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

  function readTextObject(obj: tiled.MapObject) {
    const { x, y, height, width, properties, text } = obj;
    if (!x || !y || !height || !width) return;
    const tileId = 97; // Solid Wall
    const type = Type.Wall;

    const str = text!.text!;
    const wrap = text!.wrap;

    const px = x / 24;
    const py = y / 36;
    const w = width / 24;

    let lines = [str];
    if (wrap) {
      lines = wrapString(str, w).split('\n');
    }

    const { halign, color } = obj.text!;

    const props = ensureObject(properties || {});
    const fg = props.fgColor ?? color ?? Color.HighIntensityWhite;
    const bg = props.bgColor ?? Color.Brown;

    for (let y = 0; y < lines.length; y++) {
      let line = lines[y];
      if (halign === 'right') {
        line = line.padStart(w, ' ');
      }
      for (let x = 0; x < line.length; x++) {
        const xx = px + x;
        const yy = py + y;

        const e = tiles.createEntityFromTileId(
          tileId,
          xx,
          yy,
          ensureObject(properties),
          type
        );
        e.get(Renderable)!.ch = line[x];
        e.get(Renderable)!.fg = fg;
        e.get(Renderable)!.bg = bg;

        output[yy * tilemap.width + xx] = e;
      }
    }
  }

  function readUnencodedTileLayer(layer: tiled.UnencodedTileLayer) {
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

  function addRandomData(randomLevelData: string) {
    const tileKeys = processDF(randomLevelData);
    const tileArray = shuffle(tileKeys.split(''));
    const width = XMax + 1;

    let i = 0;
    while (i < tileArray.length) {
      const p = RNG.getUniformInt(0, output.length - 1);
      const e = output[p];
      if (!e || e.type === Type.Floor) {
        const tileId = getASCIICode(tileArray[i]);
        const x = p % width;
        const y = Math.floor(p / width);
        output[p] = tiles.createEntityFromTileId(tileId, x, y);
        i++;
      }
    }
  }
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

function processDF(levelData: string): string {
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

  return tileKeys;
}

function getTileIdFromGID(gid: number): number {
  if (!gid || gid < 0) return -1;
  return (+gid % 256) - 1;
}
