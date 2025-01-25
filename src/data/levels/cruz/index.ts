const LEVELS = [
  null,
  // async () => (await import('../debug.map.json')).default, // Must be level 0

  async () => (await import('./cruz-1--Your-Hut.map.json')).default,
  null,
  async () => (await import('./cruz-3--Entrance.map.json')).default,
  async () => (await import('./cruz-4--InsideRuins.map.json')).default,
  async () => (await import('./cruz-158--Escape.map.json')).default,
  async () => (await import('./cruz-160--TheAdventureEnds.map.json')).default,
];

export default LEVELS;
