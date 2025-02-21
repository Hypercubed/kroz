// 'The Forgotten Adventures of Kroz'
// import type * as tiled from '@kayahr/tiled';

export const title = 'The Forgotten Adventures of Kroz';

// function addRandom(map: tiled.Map, value: string) {
//   map.properties ??= [];
//   map.properties.push({
//     name: 'DF',
//     type: 'string',
//     value
//   } as tiled.AnyProperty);
//   return map;
// }

export const LEVELS = [
  // async () =>
  //   addRandom(
  //     (await import('../forgotten/proc.map.json')).default,
  //     `  1  X  #  ‘\n 80 50 15  9`
  //   ),
  null,

  // 1
  async () => (await import('./start.map.json')).default, // Must be level 0
  async () => (await import('./classics.map.json')).default,
  async () => (await import('./instructions.map.json')).default
];

export async function readTileset() {
  return (await import('../kroz.tileset.json')).default;
}

export async function readColor() {
  return (await import('../kroz.colors.json')).default;
}
