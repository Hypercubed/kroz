// Lost Adventures of Kroz, Level 2 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import { FLOOR_CHAR } from '../constants';
import { TileChar, Tile, TileColor } from '../tiles';

/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

const map = `
XXXXXXXXXXXXXXXXXXX#XXXXXXXXXXXXXXXXXXXXXXXX#XXXXXXXXX### P ###X
XXXXX##XXXXXXXXXXXXXXXXXXX##XXXXXXXXXXXXXXXXXXXXXXXXXXXX##  ##XX
XXXXXXXXXXXXXXX&-XXXXXXXXXXXXXXXXXX#XXXXXXXXXXXXXXXX#XXXXX#  #XX
#XXXXXXXXXXXXXXXX-XXXX--XXXXXXXXXXXXXXXX##XXXXXXXXXXXXXXXX  XXXX
XXXXXXXXX#XXXXXXXX-XX-XX-XXXXXXX#XXXXXXXXXXXXXXXXXXXXX##   #XXXX
XXX#XXXXXXXXXXX#XXX--XX#X--XXXXXXXXX#XXXXX#XXXX##XXXX##  ##XXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXX--XXXXXXXXXXXXXXXXXXXXXXX##XX##XXXXXX
XXXXXXXXXXX##XXXXXXXXXXXXX#XX-XXXXXXXXXXXXXXXXXXXXX##  ##XXXX##X
XXXXX#XXXXXXXXXXXX#XXXXXXXXXXX--XXXX##XXXXXX#XXXXX##  ##XXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXX#XXXXXXX-#XXXXXXXXXXXXX      XXXX#XXXXXX
XXXXX##XXXXXX#XXXXXXX#XXXXXXXXXX#X##XXXXX       XXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXX##XXX#   0    XXXXXXXX!XXXXXXXXXXXXX
XXXXXXXXXXXXXX#XXXXXXX===XXXXXXX#  XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXX#XXXXXXXXXXXX=======XXXXX  XXXXXXXX#XXXXX#XXXXXXXXXX##XXX
XXXXXXXXXXXXXXXXX=========       XX=====XXXXXXXXXXXXX#XXXXXXXXXX
XX#XXXXXXX##XXX==========  ===========XXXXXXXXXXXXXXXXX#XXXXXXXX
XXXXXXXXXXXXXX==========  ===========XXXXXXXXX##XXXXXXXXXXXXXXXX
XXXX#XXXXXXX             ===========XX#XXXXXXXXXXXXXXXXXXXXX#XXX
XXXXXXXX    XX#XXXX================XXXXXXXX#XXXXXX#XXXXXXXXXXXXX
XXX     XX#XXXXXXXXXX===========XXXXXXXXXXXXXXXXXXXX##the#secret
XXXXXXXXXXXXXXXXXX#XXXXXX=====XXXXXXXXXX#XXXXXXXXXXX#tunnel#into
X  XX#XXXXXX##XXXXXXXXXXXXXXXXXX#XXXXXXXXXXXXXXXXXXX#the#kingdom
LLXXXXXX#XXXXXXXXXXXXX#XXXXXXXXXXXXXX#4XXXXXX##XXXXX#####of#kroz
`;

async function onLevelStart() {
  TileChar[Tile.Stairs] = FLOOR_CHAR; // HideGems
  TileColor[Tile.Stairs] = TileColor[Tile.Floor];
}

export default {
  id: 'Lost2',
  map,
  onLevelStart,
};
