// Lost Adventures of Kroz, Level 18 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as world from '../modules/world';

import { Type } from '../data/tiles';

export const id = 'Lost18';

const map = `
K----------------------------YYY!YYY---------------------------K
-66666666666666666666666666666666666666666666666666666666666666-
-66ñ                           —+          DTDTDTDTLL 66   -"66-
-66                                        6666666666666   --66-
-6666666666666666666666666666666666                          66-
-66<-     )                   66 ..                          66-
-66--     #############       66 66      ##$$$$$$$$$$$##     66-
-66      ##11111111111##      66 66      ###MMMMMMMMM###     66-
-66     ##1111111111111(      66 66      ####MMMMMMM####     66-
-66     ##1111111111111(      66(66      ##W##MMMMM##W##     66-
-66      ##11111111111(       66 66      ##WW##MMM##WW##     66-
-44)))))))############(       66P66      ##WWW##&##WWW##     55-
-66      )11111111111##       66 66      ##....###....##     66-
-66     )1111111111111##      66 66      ##     #     ##     66-
-66     )1111111111111##      66 66      ##     —     ##     66-
-66     ##11111111111##       66 66      ##           ##     66-
-66      #############        66 66      ##]]]]]]]]]]]##   --66-
-66                           .. 66                        -[66-
-66                           666666666666666666666666666666666-
-66--   6666666666666         +—                             66-
-66|-   66 LLWDWDWDWD                                       ò66-
-66666666666666666666666666666666666666666666666666666666666666-
K----------------------------3333333---------------------------K`;

async function onLevelStart() {
  // HideCreate
  world.level.map.hideType(Type.Create);

  // HideMBlock
  world.level.map.hideType(Type.MBlock);
}

export default {
  id: 'Lost18',
  map,
  onLevelStart,
  tabletMessage: 'Adventurer, check the "Valley of the M"!',
};
