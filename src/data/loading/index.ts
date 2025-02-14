// 'The Forgotton Adventures of Kroz'

export const title = 'The Forgotton Adventures of Kroz';

export const LEVELS = [
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
