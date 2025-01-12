// KINGDOM OF KROZ II, Level 6 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as world from '../modules/world';
import { Type } from '../data/tiles';

const map = `
---###########RRRRR##W        ############W////1/C//♣//♣♣♣♣♣♣♣♣♣
-U---------Z###RRRRR##7######   ##KKô   Z##-//////♣///1/♣♣♣♣♣♣U♣
---###########RRRRR##7####### P ######## ###-////////♣///♣♣1♣♣♣♣
@#############RRRRR#7####                ####-///♣/////////♣♣♣♣♣
@2#------.###RRRRR##7#W3; ############## #####-////1//♣//1///♣♣♣
@##;-;###.##RRRRR##7##W3; #WWWWWWWWWWW## #2####--//////////♣///♣
@2#-;;##..##RRRRR##7##W3; ######-####### ##2#####-/////♣/////1//
@##;-;##..-##RRRRR##7#### #11111111111## ###2##2##-/////1/////♣/
@2#;;-##..#D##RRRRR##7##T #11111111111## #2##2##2##--///////♣///
@##;;;##..#D###RRRRR##7####11111111111## ##2##2##2###---///////1
@2#-;;##..#KK###RRRRR##7###11111111111## ###)##)##)#####--////♣/
@##-;;##..#KK##RRRRRRR#7###11111B11111----)))))))))))#####---///
@2#;;;##22####RRRR#RRR##7##11111111111##############)########--/
@##;;-##22###RRRR###RRR##7#11111111111#?#•#---#*YYYY-63333####D#
@2#;-;##22##RRRR##L##RRR#7#11111111111#O#T#-#-#*YYYY-63333---#D#
@##;;;##22#RRRR##DD##RRR#7#11111111111#O#-4-#-#*YYYY-63333-#-4-#
@2#;-;##-##RRRR#DDD#RRR##7###########-#O#-#-#-#*YYYY-63333-#-#-#
@##;;-##C#RRRR##DDD##RRR##7###+++++##-#O#-#-#-#*YYYY-63333-#-#-#
@2#;;;##H##RRRR#DDDD##RRR##7##+++++##-#O#-#-#-#*YYYY-63333-#-#-#
@##;-;####RRRR##44444##RRR##7###.####-#O#-#-#-#*YYYY-63333-#-#-#
@2#-;;###RRRR##ñññññññ##RRR#7###.#K-#-#O#-#-#-#*YYYY-63333-#-#-#
@###-###RRRR##X--------#RRR##ô##.#--#-#-#---#-######-#####-#---#
-----##RRRR##%X---U----##RRR#K##--------#111#--------------#111#`;

async function onLevelStart() {
  // HideOpenWall
  world.level.map.hideType(Type.OWall1);
  world.level.map.hideType(Type.OWall2);
  world.level.map.hideType(Type.OWall3);
}

export default {
  id: 'Kingdom6',
  map,
  tabletMessage: `A strange magical gravity force is tugging you downward!`,
  onLevelStart,
};
