// Lost Adventures of Kroz, Level 75 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as screen from '../modules/screen';
import * as sound from '../modules/sound';
import * as state from '../modules/state';
import * as world from '../modules/world';

import { FLOOR_CHAR, XSize, YSize } from '../data/constants';
import { TileChar, Tile } from '../data/tiles';

const map = `
ñö22222229       &#the#sacred#chamber#of#kroz#&2      82222222õò
öö22222999      F       $®$$$$$$$$$$$¯$ 2    .    F   88822222õõ
22222999     2• .   ”   $$$333333333$$$         •    2  88822222
222999   ”   ###        $$3=========3$$   ]    ###        888222
2999   .     #K#       $$3==úúúùúúú==3$$       #ó# .        8882
99   F  ]    #K#  2   $$3==úúùVVVùúú==3$$   2  #2#    ”    2  88
RRRRRRR      #0#      $3==úùïúVAVúïùú==3$      #2#       RRRRRRR
22222RR.     #0# .    $3==úùùúVVVúùùú==3$ .    #2#  2   .RR22222
22222RR  2   #0#      $$3==úúùú6úùúú==3$$      #2#       RR22222
22222RR      #D#   2   $$3==úúù&ùúú==3$$    ‘  #D#     2 RR22222
22222RR                 $$3==úú0úú==3$$                  RR22222
22222RR     2        ]   $3==úúGúú==3$    ”    .   2   . RR22222
22222RR  .     ”     .   $$3==úDú==3$$                ]  RR22222
22222RR    F              $$3=====3$$   2      2    ”    RR22222
RRRRRRR 2         2        $$33333$$       ]      F     2RRRRRRR
444444444444444’            $$$$$$$   .      .  H444444444444444
77777777777777###   ‘ .        P           2   ###YYYYYYYYYYYYYY
77777777777777#U#       2                      #U#YYXXXXXXXXXXXX
77777777777777#-#  2       .   T      2        #0#YYXXYYYYYYYYYY
77777777777777#<#   ]          ” 2       ”    2#0#YYXXYYOOOOOOOO
77777777777777#[#        2  5555555 N     .    #0#YYXXYYOOYYYYYY
77777777777777#|#          55DDDDD55 2      F  #0#YYXXYYOOYYXXXX
K777777777777C#"#E  2     555D]!]D555     2    40#CYXXYYOOYYXX]K
`;

async function onLevelStart() {
  TileChar[Tile.Create] = FLOOR_CHAR;
}

async function tabletMessage() {
  await world.prayer();
  await screen.flashMessage('"Ttocs Rellim Setalutargnoc Uoy!"');
  await screen.flashMessage(
    'Your palms sweat as the words echo through the chamber...',
  );
  for (let x = 0; x <= XSize; x++) {
    for (let y = 0; y <= YSize; y++) {
      if (state.level.map.get(x, y) === Tile.Pit) {
        await sound.play(x * y, 50, 10);
        state.level.map.set(x, y, Tile.Rock);
        screen.drawTile(x, y, Tile.Rock);
      }
    }
  }
  await screen.flashMessage('...Your eyes widen with anticipation!');
}

export default {
  id: 'Lost75',
  map,
  onLevelStart,
  tabletMessage,
  // MagicEWalls:=true;EvapoRate:=22;
};

// ú -> ·
// ù -> ∙
// ï -> ∩
