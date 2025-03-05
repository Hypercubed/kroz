import * as tiles from '../modules/tiles';

import type { Entity } from '../classes/entity';
import { XMax, YMax } from '../constants/constants';
import type { Level } from '../modules/levels';
import { getASCIICode, shuffle } from './utils';
import { Type } from '../constants/types';

const WIDTH = XMax + 1;
const HEIGHT = YMax + 1;
const SIZE = WIDTH * HEIGHT;

const PF = '[PF]';
const DF = '[DF]';
const ST = '[ST]';

// TODO: Support for submaps
// TODO: Support for multiple levels in a single file (including combine DF and PF)
export function readKrozJSON(level: {
  PF: string;
  DF: string;
  ST: string;
}): Level {
  let data: Entity[] = [];
  let startTrigger = '';

  for (const [key, value] of Object.entries(level)) {
    switch (key) {
      case 'PF':
        data = readLevelMap(value);
        break;
      case 'DF':
        data = readRandomLevel(value);
        break;
      case 'ST':
        startTrigger = value;
        break;
    }
  }

  // Fill in any remaining tiles with floor tiles
  // TODO: This should be able to be handled when reading the level data
  for (let i = data.length; i < SIZE; i++) {
    if (!data[i]) {
      data[i] = tiles.createEntityOfType(Type.Floor);
    }
  }

  return {
    id: '',
    data,
    startTrigger: startTrigger ?? undefined,
    properties: {}
  };
}

// TODO: use readKrozJSON instead?
export function readKrozTxt(level: string): Level {
  let data: Entity[] = [];
  let startTrigger = '';
  let lineIndex = 0;

  const lines = level
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.trimEnd());

  while (lineIndex < lines.length) {
    const line = lines[lineIndex++].trim();
    switch (line) {
      case PF:
        data = _readLevelMap();
        break;
      case DF:
        data = _readRandomLevel();
        break;
      case ST:
        startTrigger = _readStartTrigger();
        break;
    }
  }

  // Fill in any remaining tiles with floor tiles
  for (let i = data.length; i < SIZE; i++) {
    if (!data[i]) {
      data[i] = tiles.createEntityOfType(Type.Floor);
    }
  }

  return {
    id: '',
    data,
    startTrigger: startTrigger ?? undefined,
    properties: {}
  };

  function _readLevelMap() {
    let value = '';
    for (let y = 0; y < HEIGHT; y++) {
      value += lines[lineIndex++].trimEnd().padEnd(XMax + 1, ' ') + '\n';
    }
    return readLevelMap(value);
  }

  function _readRandomLevel() {
    let keys = '';
    let counts = '';

    while (lineIndex < lines.length) {
      const line = lines[lineIndex++];
      if (line.startsWith('[')) {
        lineIndex--;
        break;
      }
      keys += line;
      counts += lines[lineIndex++] + '\n';
    }

    return readRandomLevel(keys + '\n' + counts);
  }

  function _readStartTrigger() {
    let startTrigger = '';
    while (lineIndex < lines.length) {
      const line = lines[lineIndex++];
      if (line.startsWith('[')) {
        lineIndex--;
        break;
      }
      startTrigger += line + '\n';
    }
    return startTrigger;
  }
}

// TODO: Read actual size for submaps
function readLevelMap(value: string) {
  const data: Entity[] = [];

  const lines = value.split(/\r?\n/);
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y].trimEnd().padEnd(XMax + 1, ' ');
    for (let x = 0; x < line.length; x++) {
      const char = line.charAt(x) ?? ' ';
      const tileId = getASCIICode(char);
      data.push(tiles.createEntityFromTileId(tileId, x, y));
    }
  }
  return data;
}

function readRandomLevel(value: string) {
  const data: Entity[] = [];

  let tileKeys = '';

  const lines = value.split(/\r?\n/);
  for (let lineIndex = 0; lineIndex < lines.length; ) {
    const keys = lines[lineIndex++];
    const counts = lines[lineIndex++];
    for (let i = 0; i < keys.length; i += 3) {
      const key = keys.substring(i, i + 3).trim();
      const count = key === 'P' ? 1 : +counts.substring(i, i + 3);
      tileKeys += key.repeat(count);
    }
  }

  if (tileKeys.length < SIZE) {
    tileKeys += ' '.repeat(SIZE - tileKeys.length);
  }

  const tileArray = shuffle(tileKeys.split(''));

  for (let i = 0; i < SIZE; i++) {
    const tileId = getASCIICode(tileArray[i]);
    const x = i % WIDTH;
    const y = Math.floor(i / WIDTH);
    data[i] = tiles.createEntityFromTileId(tileId, x, y);
  }

  return data;
}
