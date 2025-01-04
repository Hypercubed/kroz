import debug from './levels/debug.ts';

// Lost Adventures of Kroz
import lost1 from './levels/lost-1.ts';
import lost2 from './levels/lost-2.ts';
import lost4 from './levels/lost-4.ts';
// import lost11 from './levels/lost-11.ts';
import lost18 from './levels/lost-18.ts';
// import lost20 from './levels/lost-20.ts';
// import lost22 from './levels/lost-22.ts';
import lost26 from './levels/lost-26.ts';
import lost30 from './levels/lost-30.ts';
// import lost33 from './levels/lost-33.ts';
import lost34 from './levels/lost-34.ts';
import lost42 from './levels/lost-42.ts';
import lost75 from './levels/lost-75.ts';

// KINGDOM OF KROZ
import kingdom1 from './levels/kingdom-1.ts';

// Caverns of Kroz 2
import caverns2 from './levels/caverns-2.ts';
import caverns4 from './levels/caverns-4.ts';
import lost46 from './levels/lost-46.ts';
import lost48 from './levels/lost-48.ts';

export interface Level {
  id: string;
  map: string;
  name?: string;
}

export const LEVELS: Level[] = [
  debug, // Most be level 0
  lost1,
  lost2,
  lost4,
  caverns2,
  caverns4,
  kingdom1,
  // lost11 as Level, Need more keys
  lost18,
  // lost20 as Level, // Need a keys, Needs MBlocks
  // lost22 as Level, // Needs MBlocks
  lost26,
  lost30, // Need whips
  // lost33 as Level, // Needs WallVanish
  lost34,
  // lost35, // Needs lava flow
  // lost40, // Needs two keys to start
  lost42, // Needs Tree growth
  lost46,
  lost48,
  lost75,
];

// Possible levels to add:
// - caverns-9
// - caverns-11
// - caverns-14
// - final crusade of kroz - 1
// - dungeon of kroz - 1
// - dungeon of kroz - 3
// - temple of kroz - 1
// - kingdom - 1
// - kingdom - 4
// - kingdom - 5
// - kingdom - 7
// - kingdom - 21
// - kingdom - 25
// - castle of kroz - 1
