export const title = 'DEBUG';

export const LEVELS = [
  // 1
  async () => (await import('../debug/debug.map.json')).default,
  async () => (await import('../debug/speed.map.json')).default,
  async () => (await import('../debug/pushables.map.json')).default
];
