// 'The Forgotten Adventures of Kroz'

export const title = 'The Forgotten Adventures of Kroz';

export const LEVELS = [
  async () => (await import('./start.map.json')).default,
  async () => (await import('./classics.map.json')).default,
  async () => (await import('./instructions.map.json')).default
];
