import debug from './levels/debug.ts';

// Lost Adventures of Kroz
import lost1 from './levels/lost-1.ts';
import lost2 from './levels/lost-2.ts';
import lost4 from './levels/lost-4.ts';
import lost11 from './levels/lost-11.ts';
import lost20 from './levels/lost-22.ts';
// import lost22 from './levels/lost-22.ts';
import lost26 from './levels/lost-26.ts';
import lost30 from './levels/lost-30.ts';
// import lost33 from './levels/lost-33.ts';
import lost42 from './levels/lost-42.ts';
import lost75 from './levels/lost-75.ts';

// KINGDOM OF KROZ
import kingdom1 from './levels/kingdom-1.ts';

// Caverns of Kroz 2
import caverns2 from './levels/caverns-2.ts';
import caverns4 from './levels/caverns-4.ts';

interface Level {
  id: string;
  map: string;
  name?: string;
}

export const LEVELS: Level[] = [
  debug as Level, // Most be level 0
  lost1 as Level,
  lost2 as Level,
  lost4 as Level,
  caverns2 as Level,
  caverns4 as Level,
  kingdom1 as Level,
  lost11 as Level,
  lost20 as Level,
  // lost22 as Level, // Needs MBlocks
  lost26 as Level,
  lost30 as Level,
  // lost33 as Level, // Needs WallVanish
  lost42 as Level,
  lost75 as Level,
];
