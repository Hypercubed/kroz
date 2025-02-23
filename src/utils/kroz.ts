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

export function readKrozLevel(level: string): Level {
  const data: Entity[] = [];
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
        readLevelMap();
        break;
      case DF:
        readRandomLevel();
        break;
      case ST:
        readStartTrigger();
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

  function readLevelMap() {
    for (let y = 0; y < HEIGHT; y++) {
      const line = lines[lineIndex++].trimEnd().padEnd(XMax + 1, ' ');
      for (let x = 0; x < WIDTH; x++) {
        const char = line.charAt(x) ?? ' ';
        const tileId = getASCIICode(char);
        data.push(tiles.createEntityFromTileId(tileId, x, y));
      }
    }
  }

  function readRandomLevel() {
    let tileKeys = '';

    while (lineIndex < lines.length) {
      const keys = lines[lineIndex++];
      if (keys.startsWith('[')) {
        lineIndex--;
        break;
      }
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
  }

  function readStartTrigger() {
    while (lineIndex < lines.length) {
      const line = lines[lineIndex++];
      if (line.startsWith('[')) {
        lineIndex--;
        break;
      }
      startTrigger += line + '\n';
    }
  }
}
