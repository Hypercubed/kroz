// KINGDOM OF KROZ II, Level 22 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as world from '../modules/world';
import * as screen from '../modules/screen';
import * as state from '../modules/state';
import * as sound from '../modules/sound';

import { FLOOR_CHAR, XSize, YSize } from '../data/constants';
import { TypeChar, Type } from '../data/tiles';

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
]]K]]##“                   RRRRRRK]                     DDDD77ô!`;

async function onLevelStart() {
  TypeChar[Type.Create] = FLOOR_CHAR;
}

async function tabletMessage() {
  await world.prayer();
  await screen.flashMessage(
    '"If goodness is in my heart, that which flows shall..."',
  );

  // Replace River with Nugget
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.level.map.getType(x, y) === Type.River) {
        await sound.play(x * y, 50, 10);
        state.level.map.setType(x, y, Type.Nugget);
        screen.drawEntity(x, y);
      }
    }
  }

  await screen.flashMessage('"...Turn to Gold!"');
}

export default {
  id: 'Kingdom22',
  map,
  onLevelStart,
  tabletMessage,
};

// Needs IWalls
