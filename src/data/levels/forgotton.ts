import { readLevelJSON } from "../../modules/levels";

import debug from "./debug.json";
import lost1 from "./lost/lost-1.json";
import lost2 from "./lost/lost-2.json";
import lost4 from "./lost/lost-4.json";

import caverns2 from "./caverns/caverns-2.json";
import caverns4 from "./caverns/caverns-4.json";

import kingdom1 from "./kingdom/kingdom-1.json";
import kingdom2 from "./kingdom/kingdom-2.json";
import kingdom4 from "./kingdom/kingdom-4.json";
import kingdom6 from "./kingdom/kingdom-6.json";
import kingdom12 from "./kingdom/kingdom-12.json";

import lost11 from "./lost/lost-11.json";

import lost18 from "./lost/lost-18.json";
import lost20 from "./lost/lost-20.json";
import lost26 from "./lost/lost-26";
import lost30 from "./lost/lost-30";
import lost34 from "./lost/lost-34.json";
import lost42 from "./lost/lost-42";
import lost46 from "./lost/lost-46.json";
import lost48 from "./lost/lost-48.json";
import lost52 from "./lost/lost-52";
import lost59 from "./lost/lost-59.json";
import lost61 from "./lost/lost-61";
import lost64 from "./lost/lost-64";
import lost70 from "./lost/lost-70.json";
import lost75 from "./lost/lost-75";

// 'The Forgotton Adventures of Kroz'
const LEVELS = [
  readLevelJSON(debug), // Must be level 0

  readLevelJSON(lost1),
  readLevelJSON(lost2),
  readLevelJSON(lost4),
  readLevelJSON(caverns2),
  readLevelJSON(caverns4),
  readLevelJSON(kingdom1),
  readLevelJSON(kingdom2), // Ends with extra key
  readLevelJSON(kingdom4), // Needs a teleport from previous level, Optional short left
  readLevelJSON(kingdom6),
  readLevelJSON(lost11), // Key from previous level

  readLevelJSON(kingdom12), // Needs LavaFlow
  readLevelJSON(lost18),
  readLevelJSON(lost20), // Need a keys
  // readLevelJSON(lost22),
  lost26,  // Needs tabletMessage function
  lost30, // Needs tabletMessage function, Need whips, Same as Kingdom 22
  // lost33, // Needs to start with a key
  readLevelJSON(lost34),
  lost42, // Needs Tree growth
  readLevelJSON(lost46), // Same as Kingdom 14
  readLevelJSON(lost48), // tabletMessage
  lost52,

  readLevelJSON(lost59), // Needs LavaFlow
  lost61,
  lost64,
  readLevelJSON(lost70),
  // lost74,
  lost75,
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