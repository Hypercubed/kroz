import { default as RNG } from 'rot-js/lib/rng';

import * as state from './state.ts';
import * as tiles from '../tiles.ts';

import debug from '../levels/debug.ts';

// Lost Adventures of Kroz
import lost1 from '../levels/lost-1.ts';
import lost2 from '../levels/lost-2.ts';
import lost4 from '../levels/lost-4.ts';
import lost11 from '../levels/lost-11.ts';
import lost18 from '../levels/lost-18.ts';
import lost20 from '../levels/lost-20.ts';
// import lost22 from './levels/lost-22.ts';
import lost26 from '../levels/lost-26.ts';
import lost30 from '../levels/lost-30.ts';
// import lost33 from './levels/lost-33.ts';
import lost34 from '../levels/lost-34.ts';
import lost42 from '../levels/lost-42.ts';
import lost70 from '../levels/lost-70.ts';
import lost46 from '../levels/lost-46.ts';
import lost48 from '../levels/lost-48.ts';
import lost52 from '../levels/lost-52.ts';
import lost59 from '../levels/lost-59.ts';
import lost61 from '../levels/lost-61.ts';
import lost64 from '../levels/lost-64.ts';
// import lost74 from './levels/lost-74.ts';
import lost75 from '../levels/lost-75.ts';

// KINGDOM OF KROZ
import kingdom1 from '../levels/kingdom-1.ts';
import kingdom2 from '../levels/kingdom-2.ts';
import kingdom4 from '../levels/kingdom-4.ts';
import kingdom6 from '../levels/kingdom-6.ts';
// import kingdom10 from '../levels/kingdom-10.ts';
import kingdom12 from '../levels/kingdom-12.ts';
// import kingdom14 from '../levels/kingdom-14.ts';
// import kingdom16 from '../levels/kingdom-16.ts';
// import kingdom20 from '../levels/kingdom-20.ts';
// import kingdom22 from '../levels/kingdom-22.ts';
// import kingdom25 from '../levels/kingdom-25.ts';

// Caverns of Kroz 2
import caverns2 from '../levels/caverns-2.ts';
import caverns4 from '../levels/caverns-4.ts';

import { MapLookup, Tile, TileColor } from '../tiles.ts';
import { FLOOR_CHAR } from '../constants.ts';
import { Entity } from '../entities.ts';
import { Timer } from './state.ts';

export interface Level {
  id: string;
  map: string;
  name?: string;
  onLevelStart?: () => Promise<void>;
  onLevelEnd?: () => Promise<void>;
  tabletMessage?: (() => Promise<void>) | string;
}

// KINGDOM OF KROZ II Levels
// export const LEVELS: Level[] = [
//   debug, // Must be level 0
//   kingdom1,
//   kingdom2,  // Ends with extra key
//   kingdom4,  // Needs a teleport from previous level, Optional shoort left
//   kingdom6,
//   // kingdom10, // Needs boulders to break EWalls
//   kingdom12,
//   kingdom14, // Same as level 46 of Lost Adventures.
//   // kingdom16, // Similar to level 33 of Lost Adventures (needs more traps)
//   // kingdom20, // Same as level 22 of Lost Adventures, Needs MBlocks
//   kingdom22, // Same as level 30 of Lost Adventures
//   // kingdom25 // Needs MagicEWalls
// ];

// LOST ADVENTURES OF KROZ Levels
// export const LEVELS: Level[] = [
//   debug, // Must be level 0
//   lost1,
//   lost2,
//   lost4,
//   // lost11, Need more keys
//   lost18,
//   lost20, // Need a keys
//   // lost22, // Needs MBlocks
//   lost26,
//   lost30, // Need whips
//   // lost33, // Needs WallVanish, Needs to start with a key
//   lost34,
//   // lost35, // Needs lava flow
//   // lost40, // Needs two keys to start
//   lost42, // Needs Tree growth
//   lost46,
//   lost48,
//   lost52,
//   lost59,
//   lost61,
//   lost64,
//   lost70, // TBD
//   // lost74,  // Needs EvapoRate
//   lost75
// ];

// 'The Forgotton Adventures of Kroz'
export const LEVELS: Level[] = [
  debug, // Must be level 0

  lost1,
  lost2,
  lost4,
  caverns2,
  caverns4,
  kingdom1,
  kingdom2, // Ends with extra key
  kingdom4, // Needs a teleport from previous level, Optional short left
  kingdom6,
  lost11, // Key from previous level
  kingdom12,
  lost18,
  lost20, // Need a keys
  lost26,
  lost30, // Need whips, Same as Kingdom 22
  lost34,
  lost42, // Needs Tree growth
  lost46, // Same as Kingdom 14
  lost48,
  lost52,
  lost59,
  lost61,
  lost64,
  lost70,
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
// - castle of kroz - 1

export function readLevelMap(level: string) {
  state.state.entities = [];
  state.state.T = state.state.T.map(() => 0); // Reset timers

  state.state.genNum = 0;

  const lines = level.split('\n').filter((line) => line.length > 0);
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    for (let x = 0; x < line.length; x++) {
      const char = line.charAt(x) ?? FLOOR_CHAR;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const block = (MapLookup as any)[char];

      state.state.PF[x] = state.state.PF[x] || [];
      state.state.PF[x][y] = block ?? char;

      // Special cases
      // See https://github.com/tangentforks/kroz/blob/master/source/LOSTKROZ/MASTER2/LOST4.TIT#L328
      switch (char) {
        case 'Ã':
          state.state.PF[x][y] = '!';
          break;
        case '´':
          state.state.PF[x][y] = '.';
          break;
        case 'µ':
          state.state.PF[x][y] = '?';
          break;
        case '¶':
          state.state.PF[x][y] = "'";
          break;
        case '·':
          state.state.PF[x][y] = ',';
          break;
        case '¸':
          state.state.PF[x][y] = ':';
          break;
        case 'ú':
          state.state.PF[x][y] = '·';
          break;
        case 'ù':
          state.state.PF[x][y] = '∙';
          break;
        case 'ï':
          state.state.PF[x][y] = '∩';
          break;
      }

      switch (block) {
        case Tile.Player:
          state.state.player.x = x;
          state.state.player.y = y;
          break;
        case Tile.Slow:
        case Tile.Medium:
        case Tile.Fast:
          state.state.entities.push(new Entity(block, x, y));
          break;
        case Tile.Generator:
          state.state.genNum++;
          break;
        // case Tile.MBlock
        case Tile.Statue:
          state.state.T[Timer.StatueGemDrain] = 32000;
          break;
      }
    }
  }

  // Randomize
  TileColor[Tile.Gem] = [RNG.getUniformInt(1, 15), null];
  TileColor[Tile.Border] = [RNG.getUniformInt(8, 15), RNG.getUniformInt(1, 8)];
}

export function loadLevel() {
  state.state.level?.onLevelEnd?.();
  state.state.level = LEVELS[state.state.levelIndex];
  tiles.reset();
  state.state.level?.onLevelStart?.();
  readLevelMap(state.state.level.map);
}
