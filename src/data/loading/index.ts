import * as screen from '../../modules/screen';

export const title = 'The Forgotten Adventures of Kroz';

export const LEVELS = [
  // async () => (await import('../forgotten/lost-7.map.txt?raw')).default,
  async () => (await import('./start.map.json')).default,
  async () => (await import('./classics.map.json')).default,
  async () => (await import('./instructions.map.json')).default
];

export async function start() {
  await screen.introScreen();
}
