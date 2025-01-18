import { readLevelJSON } from '../../modules/levels';

// 'The Forgotton Adventures of Kroz'
const LEVELS = [
  async () => readLevelJSON((await import('./debug.map.json')).default), // Must be level 0

  // 1
  async () => readLevelJSON((await import('./lost/lost-1.map.json')).default),
  async () => readLevelJSON((await import('./lost/lost-2.map.json')).default),
  async () => readLevelJSON((await import('./lost/lost-4.map.json')).default),
  async () =>
    readLevelJSON((await import('./caverns/caverns-2.map.json')).default),
  async () =>
    readLevelJSON((await import('./caverns/caverns-4.map.json')).default),
  async () =>
    readLevelJSON((await import('./kingdom/kingdom-1.map.json')).default),
  async () =>
    readLevelJSON((await import('./kingdom/kingdom-2.map.json')).default), // Ends with extra key
  async () =>
    readLevelJSON((await import('./kingdom/kingdom-4.map.json')).default), // Needs a teleport from previous level, Optional short left
  async () =>
    readLevelJSON((await import('./kingdom/kingdom-6.map.json')).default),
  async () => readLevelJSON((await import('./lost/lost-11.map.json')).default), // Key from previous level

  // 11
  async () =>
    readLevelJSON((await import('./kingdom/kingdom-12.map.json')).default), // Needs LavaFlow
  async () => readLevelJSON((await import('./lost/lost-18.map.json')).default),
  async () => readLevelJSON((await import('./lost/lost-20.map.json')).default), // Need a keys
  async () => (await import('./lost/lost-26')).default, // Needs tabletMessage function
  async () => (await import('./lost/lost-30')).default, // Needs tabletMessage function, Need whips, Same as Kingdom 22
  async () => readLevelJSON((await import('./lost/lost-34.map.json')).default),
  async () => (await import('./lost/lost-42')).default, // Needs Tree growth
  async () => readLevelJSON((await import('./lost/lost-46.map.json')).default), // Same as Kingdom 14
  async () => readLevelJSON((await import('./lost/lost-48.map.json')).default), // tabletMessage
  async () => (await import('./lost/lost-52')).default,

  // 21
  async () => readLevelJSON((await import('./lost/lost-59.map.json')).default), // Needs LavaFlow
  async () => (await import('./lost/lost-61')).default,
  async () => (await import('./lost/lost-64')).default,
  async () => readLevelJSON((await import('./lost/lost-70.map.json')).default),
  async () => (await import('./lost/lost-75')).default,
];

export default LEVELS;

// Possible levels to add:
// - caverns-9
// - caverns-11
// - caverns-14
// - final crusade of kroz - 1
// - dungeon of kroz - 1
// - dungeon of kroz - 3
// - temple of kroz - 1
// - castle of kroz - 1
