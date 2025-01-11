// Lost Adventures of Kroz, Level 75 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as state from '../modules/state';

import { Type } from '../data/tiles';

const map = `
    0             #heat#waveÃ#    @òRRRRR22222222222222222244–\`L
;;===00  99999F                   @@@RRRRR2222222222222222244–::
$===00   99ö99.             F  .      RRRRRR22222222222222244444
W====00  99999        F .         ”””   RRRRR2222222222222222222
WW====0            .    77777            RRRRRR22222222222222222
WWW===00        F       77ô77.    F     F RRRRRR2222222222222222
¯$====0   F             77777            .  RRRRRR22222222222222
¯=====00  $$$$$$$$$$$ F      F@@@@@@@@@      RRRRRR2222222222222
====000   $222222222$         @2222222@   F    RRRRR222222222222
==000     ##############################        RRRRRR2222222222
00– – – –Z##2-U-<##2-U-[##2-U-|##2-U-"##Z .   P   RRRRRR22222222
#############################################àà    RRRRRRR222222
K88------‘##‘-----88K##K88-----‘##‘-----88K##2à F    RRRRRRR2222
#########-##-##################-##-##########2à   .    RRRRRRR22
Q002222222222222222222222222222222222222222##2à      F   RRRRRRR
0002222222222222222222222222222222222222222##2à            RRRRR
0002222222222222222222222222222222222222222##àà  F       F   RRR
666666666666666666666666666666666666666666688        .     .    
)))))))))))))))))))))))))))))))))))))))))))##5#######áá      :  
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM##-:-’-:ó62á    :::  
(((((((((((((((((((((((((((((((((((((((((((##-:-:-:à#2á F ::>:: 
####-########################################-:-:-:-#2á    :;:  
¯00---22222222222222222-<[|"D-‘-D-‘-D-’-ñõ!##-’-:-’-#2á    :   U

`;

async function onLevelStart() {
  state.level.evapoRate = 22;

  // HideMBlock
  state.level.map.hideType(Type.MBlock);
}

export default {
  id: 'Lost74',
  map,
  onLevelStart,
};
