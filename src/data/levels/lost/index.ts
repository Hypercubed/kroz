import { readLevelJSON } from '../../../modules/levels';

// LOST ADVENTURES OF KROZ Levels
const LEVELS = [
  null, // Must be level 0

  async () => readLevelJSON((await import('./lost-1.map.json')).default),
  async () => readLevelJSON((await import('./lost-2.map.json')).default),
  null,
  async () => readLevelJSON((await import('./lost-4.map.json')).default),
  null,
  null,
  null,
  null,
  null,

  null,
  async () => readLevelJSON((await import('./lost-11.map.json')).default), // Need more keys
  null,
  null,
  null,
  null,
  null,
  null,
  async () => readLevelJSON((await import('./lost-18.map.json')).default),
  null,

  async () => readLevelJSON((await import('./lost-20.map.json')).default), // Need a keys
  null,
  async () => readLevelJSON((await import('./lost-22.map.json')).default),
  null,
  null,
  null,
  async () => (await import('./lost-26')).default,
  null,
  null,
  null,

  async () => (await import('./lost-30')).default, // Need whips
  null,
  null,
  null, // lost33, // Needs to start with a key
  async () => readLevelJSON((await import('./lost-34.map.json')).default),
  null, // Needs lava flow
  null,
  null,
  null,
  null,

  null, // Needs two keys to start
  null,
  async () => (await import('./lost-42')).default, // Needs Tree growth
  null,
  null,
  null,
  async () => readLevelJSON((await import('./lost-46.map.json')).default),
  null,
  async () => readLevelJSON((await import('./lost-48.map.json')).default),
  null,

  null,
  null,
  async () => (await import('./lost-52')).default,
  null,
  null,
  null,
  null,
  null,
  null,
  async () => readLevelJSON((await import('./lost-59.map.json')).default),

  null,
  async () => (await import('./lost-61')).default,
  null,
  null,
  async () => (await import('./lost-64')).default,
  null,
  null,
  null,
  null,
  null,

  async () => readLevelJSON((await import('./lost-70.map.json')).default),
  null,
  null,
  null,
  null, // lost74,
  async () => (await import('./lost-75')).default,
];

export default LEVELS;
