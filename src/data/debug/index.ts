export const title = 'DEBUG';

export const LEVELS = [
  async () => (await import('../debug/debug.map.json')).default, // Must be level 0

  // 1
  async () => (await import('../debug/effects.map.json')).default,
  async () => (await import('../debug/speed.map.json')).default
];

export async function readTileset() {
  return (await import('../kroz.tileset.json')).default;
}

export async function readColor() {
  return (await import('../kroz.colors.json')).default;
}
