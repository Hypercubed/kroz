import { readLevelJSON } from '../../../modules/levels';

// KINGDOM OF KROZ II Levels
const LEVELS = [
  null, // Must be level 0

  // Level 1
  async () => readLevelJSON((await import('./kingdom-1.map.json')).default),
  async () => readLevelJSON((await import('./kingdom-2.map.json')).default), // Ends with extra key
  null,
  async () => readLevelJSON((await import('./kingdom-4.map.json')).default), // Needs a teleport from previous level
  null,
  async () => readLevelJSON((await import('./kingdom-6.map.json')).default),
  null,
  null,
  null,

  // Level 10
  async () => readLevelJSON((await import('./kingdom-10.map.json')).default),
  null,
  async () => readLevelJSON((await import('./kingdom-12.map.json')).default),
  null,
  async () => readLevelJSON((await import('../lost/lost-46.map.json')).default), // Same as level 46 of Lost Adventures.
  null,
  async () => readLevelJSON((await import('./kingdom-16.map.json')).default),
  null,
  async () => readLevelJSON((await import('../lost/lost-18.map.json')).default), // Same as level 42 of Lost Adventures.
  null,

  // Level 20
  async () => readLevelJSON((await import('../lost/lost-22.map.json')).default), // Same as level 22 of Lost Adventures
  null,
  async () => (await import('../lost/lost-30')).default, // kingdom22, // Same as level 30 of Lost Adventures
  null,
  null,
  async () => readLevelJSON((await import('./kingdom-25.map.json')).default),
];

export default LEVELS;
