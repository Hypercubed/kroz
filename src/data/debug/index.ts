export const title = 'DEBUG';

export const LEVELS = [
  // 1
  async () => (await import('./debug.map.json')).default,
  async () => (await import('./speed.map.json')).default,
  async () => (await import('./pushables.map.json')).default,
  async () => (await import('./test.map.json')).default
  // async () => (await import('./lost-20.map.toml')).default,
  // async () => (await import('../lost/lost-3.map.txt?raw')).default,
  // async () => (await import('../lost/lost-20.map.txt?raw')).default
];
