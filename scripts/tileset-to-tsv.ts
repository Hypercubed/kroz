import { Parser } from '@json2csv/plainjs';

import tileset from '../src/data/kroz.tileset.json';
import { ensureObject } from '../src/utils/utils';

const objs = tileset.tiles.map((tile) => {
  const { id, properties, type } = tile;
  const props = convertProps(properties);
  return { id, type, ...props };
});

try {
  const parser = new Parser();
  const csv = parser.parse(objs);
  console.log(csv);
} catch (err) {
  console.error(err);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertProps(properties: any) {
  const p = ensureObject(properties);
  for (const key in p) {
    if (typeof p[key] === 'object') {
      const o = p[key] as Record<string, unknown>;
      delete p[key];
      for (const k in o) {
        p[`${key}.${k}`] = o[k];
      }
    }
  }
  return p;
}
