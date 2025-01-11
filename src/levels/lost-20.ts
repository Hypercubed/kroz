// Lost Adventures of Kroz, Level 20 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller
import * as state from '../modules/state';

import { Type } from '../data/tiles';

const map = `
<33333333333333333333333333333333333333333333333333333333333333[
3                                                              3
3                                                              3
3                                                              3
3           YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY           3
3           YC     F        F   Z         W    F òKY           3
3           Y          W           F     F       òòY           3
3           Y    F            òòòòò          F   F Y           3
3           YW         F      ò   ò  F             Y           3
3           Y                 ò P ò             W  Y           3
3           Y    W F      F   òF  ò   F    F       Y           3
3           Y                 òòòòò   W        F   Y           3
3           Y F              F                     Y           3
3           Yòò       F   W       F       F      F Y           3
3           YKò F               Z           W     CY           3
3           YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY           3
3                                                              3
3                                                              3
3                                                              3
"33333333333333333333333333333333333333333333333333333333333333|
5##############################444#############################5
--~~-~--~-~--~~-~~--~--~-D-D-++-L-WW-D-D-~--~--~-~~-~--~~-~~-~--
-~--~-~~-~-~~--~--~~-~~--D-D-++ñLñWW-D-D--~~-~~-~--~-~~--~--~-~-`;

async function onLevelStart() {
  // HideOpenWall
  state.level.map.hideType(Type.OWall1);
  state.level.map.hideType(Type.OWall2);
  state.level.map.hideType(Type.OWall3);
}

export default {
  id: 'Lost20',
  map,
  onLevelStart,
};
