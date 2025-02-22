// 'The Forgotten Adventures of Kroz'

import start from './start.map.json';

export const title = 'The Forgotten Adventures of Kroz';

export const LEVELS = [
  null, // async () => (await import('../debug/bsp.map.json')).default,

  // 1
  async () => start, // Must be level 1
  async () => (await import('./classics.map.json')).default,
  async () => (await import('./instructions.map.json')).default
];

export async function readTileset() {
  return (await import('../kroz.tileset.json')).default;
}

export async function readColor() {
  return (await import('../kroz.colors.json')).default;
}
