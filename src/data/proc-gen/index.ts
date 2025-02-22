// 'Testing Procgen Maps'

import { PropertyType } from '@kayahr/tiled';
import { addProperty, readLevelJSONLevel } from '../../utils/tiled';

export const title = 'Testing Procgen Maps';

const emptyMap = async () => (await import('./empty.map.json')).default;
// const procMap = async () => (await import('./proc.map.json')).default;

export async function readLevel(i: number) {
  let map = await emptyMap(); // TODO: Elimitate this line, generate empty map in memory
  map = addProperty(map, {
    name: 'StartTrigger',
    type: PropertyType.STRING,
    value: startTrigger(i)
  });
  return readLevelJSONLevel(map);
}

export function findNextLevel(i: number) {
  return ++i;
}

function startTrigger(i: number) {
  let st = '';

  const _df = LEVELS[i % LEVELS.length];
  Object.keys(_df).forEach((k) => {
    st += `##RNDGEN ${k} ${_df[k as keyof typeof _df]}\n`;
  });

  return `
    ##brogue
    ${st}
    Press any key to begin this level.
  `;
}

export const LEVELS = [
  { Slow: 80, Block: 50, TBlock: 9 },
  { Slow: 100, Whip: 30, Gem: 9, Teleport: 2, GBlock: 100, TBlock: 5 },
  { Slow: 100, Gem: 45, Tunnel: 8, Nugget: 100, Quake: 3, Rock: 100 }
];
