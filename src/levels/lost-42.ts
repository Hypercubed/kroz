// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as player from '../modules/player';
import * as screen from '../modules/screen';
import * as world from '../modules/world';
import * as sound from '../modules/sound';

import { XMax, YMax } from '../data/constants';
import { Type } from '../data/tiles';

const map = `
###########klose#enkounters#of#the#krazy#kubikal#kindÃ##########
3                               P                              3
##-##############:########:#######:###########:##############:##
XXXXXXXXX##~W~W~W~W~##‘-M----M.--$$$$$$$$$-9/-/♣--♣-|##---’ò’---
---------##*~*~*~*~*##-‘.-”M-”-##$$$$$$$$$##♣--/-♣-/♣##YYYYYYYYY
MMMMMMMMM##~W~W~W~W~##M--‘-.-M-##111111111##-/-♣/--/-##(((((((((
)))))))))##*~*~*~*~*##.”-.-”-.”##222222222##/♣--♣-♣-/##(((((((((
C))))))))--~W~W~W~W~##ó.-”--‘-M##333333333##ü-//-♣-/-9-(((((((((
###################-################################9##55555555-
“-“-“-“-“##YYYYYYYYY##222222222------0---W##RRRRRRRRR##MMMMMMMMM
-----------YYYYYYYYY##@@@@@@@@@##---000---##RXXXXXXXR##MMMMMMMMM
XXXXXXXXX##YYYYYYYYY##@@@@@@@@@##--00G00--##RXXXKXXXR##MMMMMMMMM
---------##YYYYYYYYY##@@XXX@@@@##---000---##RXXXXXXXR##MMMMMMMMM
’’’’’’’’’##YYYYYYYYK##@@XZX@@@@##----0---W##RRRRRRRRR##MMMMMMMMK
-#####################-##########ô##################H##Z########
~-~[~-~-~##WWW......à1:1:1:1:1:##-773C7--7##=--=I==-=##ááááááY0"
-~-~-~-~-##WWW......##1:1:1:1:1##7-777-77-##!==-=--==##ááááááY00
~-~-~-~-~##.........##:1:1:1:1:##-77--77-7##=======-=##ááááááYYY
-~-~-~-~-##.........##1:1:1:1:1##7-7-77-77##-==-=-==I##ááááááááá
K-~-~-~-~-à..<......##:1:1:1:1ñ##77-7777---I=--=-=--=##222222222
############################################################44##
LL---V--V-VV-V--VV---D-----D--’--D--”--D--66333333333333333-WWWW
LL--V-VV-V--V-VV--V--D-----D--”--D--’--D--66YYYYYYYYYYYYYYYYYYYY
`;

async function tabletMessage() {
  await player.prayer();
  await screen.flashMessage(
    '"Barriers of water, like barriers in life, can always be..."',
  );

  // Clears River with Block
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.River) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Block);
        screen.drawEntity(x, y);
      }
    }
  }

  await screen.flashMessage('"...Overcome!"');
}

export default {
  id: 'Lost42',
  map,
  tabletMessage,
  // TreeRate:=35;
};
