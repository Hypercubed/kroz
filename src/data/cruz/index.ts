export const title = 'The Underground Empire of Cruz';

export const LEVELS = [
  null,
  // async () => (await import('../debug.map.json')).default, // Must be level 0

  // 1
  async () => (await import('./cruz-1.map.json')).default,
  async () => (await import('./cruz-2.map.json')).default,
  async () => (await import('./cruz-3.map.json')).default,
  async () => (await import('./cruz-4.map.json')).default,
  async () => (await import('./cruz-5.map.json')).default,
  null,
  null,
  null,
  null,
  null

  // async () => (await import('./cruz-158.map.json')).default,
  // async () => (await import('./cruz-160.map.json')).default,
];

export async function readTileset() {
  return (await import('../kroz.tileset.json')).default;
}

export async function readColor() {
  return (await import('../kroz.colors.json')).default;
}
