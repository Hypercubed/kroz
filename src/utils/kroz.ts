import * as tiles from '../modules/tiles';

import type { Entity } from '../classes/entity';
import { XMax, YMax } from '../constants/constants';
import type { Level } from '../modules/levels';
import { getASCIICode, shuffle } from './utils';

export function readRandomLevel(levelData: string): Level {
  const df = processDF(levelData);

  const width = XMax + 1;
  const height = YMax + 1;
  const size = width * height;
  if (df.data.length < size) {
    df.data += ' '.repeat(size - df.data.length);
  }

  const tileArray = shuffle(df.data.split(''));

  const data: Entity[] = Array(size).fill(null);
  for (let i = 0; i < size; i++) {
    const tileId = getASCIICode(tileArray[i]);
    const x = i % width;
    const y = Math.floor(i / width);
    data[i] = tiles.createEntityFromTileId(tileId, x, y);
  }

  return {
    id: '',
    data,
    startTrigger: df.startTrigger || undefined,
    properties: {}
  };
}

function processDF(levelData: string) {
  let tileKeys = '';
  const lines = levelData.split('\n');

  let y = 0;
  for (; y < lines.length && lines[y] !== '---'; y++) {
    const keys = lines[y];
    const counts = lines[++y];

    for (let i = 0; i < keys.length; i += 3) {
      const key = keys.substring(i, i + 3).trim();
      const count = key === 'P' ? 1 : +counts.substring(i, i + 3);
      tileKeys += key.repeat(count);
    }
  }

  let startTrigger = '';
  if (lines[y++] === '---') {
    for (; y < lines.length; y++) {
      startTrigger += lines[y] + '\n';
    }
  }

  return {
    data: tileKeys,
    startTrigger: startTrigger || undefined
  };
}
