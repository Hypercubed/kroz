export const title = 'The Underground Empire of Cruz';

export const LEVELS = [
  // 1
  async () => (await import('./cruz-1.map.json')).default,
  async () => (await import('./cruz-2.map.json')).default,
  async () => (await import('./cruz-3.map.json')).default,
  async () => (await import('./cruz-4.map.json')).default,
  async () => (await import('./cruz-5.map.json')).default,
  null,
  async () => (await import('./cruz-7.map.json')).default,
  async () => (await import('./cruz-8.map.json')).default,
  async () => (await import('./cruz-9.map.json')).default

  // // async () => (await import('./cruz-158.map.json')).default,
  // // async () => (await import('./cruz-160.map.json')).default,
];
