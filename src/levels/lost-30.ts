// Lost Adventures of Kroz, Level 30 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as world from '../world';
import * as screen from '../screen';
import * as state from '../state';
import * as sound from '../sound';

import { FLOOR_CHAR, XSize, YSize } from '../constants';
import { TileChar, Tile } from '../tiles';

/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

export const id = 'Lost30';

const map = `
1111144       ##C######locksmith#shoppe######C##         RRRRRRR
1111144       ##]##K#K#K#K#K#-3-3#K#K#K#K#K##]##        RRRRRRRñ
1111144          ##:::::::::######::::::::;##         RRRRRRRCYY
1111144          ##------------------------##     666RRRRRRRR66 
1111144          #############--#############     6666666666666 
1111144                                           HOOOOOOOOH    
1111144                                        6666666666666    
1111144                                        66RRRRRRR6666    
1111144                                        RRRRRRR          
1111144                                      RRRRRR           YY
1111144               P                    RRRRRR             YZ
1111144                                 RRRRRRRRRR            YY
1111144                              RRRRR333RRRRR              
1111144                             RRR3333333RRRRR             
@@@@@##                           RRR3333333333RRRRR            
MMMMM##                           RRR333333333RRRRR             
)))))##                          RRR33333333RRRRR               
MMMMM##                        RRRR333333RRRRRRR        DDDDDDDD
(((((##                       RRRR3LL3RRRRRRRR          DDDDDDDD
MMMMM##                      RRRRRRRRRRRRRR             DDDDDDDD
$$$$$##                     RRRRRRRRRRRR                DDDD7777
MMMMM##                     RRRRRRRR                    DDDD77ôô
]]K]]##“                   RRRRRRK]                     DDDD77ô!
`;

async function onLevelStart() {
  TileChar[Tile.Create] = FLOOR_CHAR;
}

async function tabletMessage() {
  await world.prayer();
  await screen.flashMessage(
    '"If goodness is in my heart, that which flows shall..."',
  );

  // Replace River with Nugget
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.state.PF[x][y] === Tile.River) {
        await sound.play(x * y, 50, 10);
        state.state.PF[x][y] = Tile.Nugget;
        world.drawTile(x, y, Tile.Nugget);
      }
    }
  }

  await screen.flashMessage('"...Turn to Gold!"');
}

export default {
  id,
  map,
  onLevelStart,
  tabletMessage,
};

// Needs IWalls
