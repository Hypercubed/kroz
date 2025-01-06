/*
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
0123456789012345678901234567890123456789012345678901234567890123
*/

import { FLOOR_CHAR } from '../constants';
import { Tile, TileChar } from '../tiles';

export const map = `
                                                       #1#1#1#1#
 ####### ##whip W W W                  ~~~~~   ewall## # # # # #
  3 3  # #chest C C C                  #####   wall### # # # # #
   3   # ##nugg * * *   ñ4444499999ö   RRRRR   river## # # # # #
  3 3  # ###gem + + +   ò5555588888õ   /////   forest# # # # # #
 ####### ##door D D D   ó6666677777ô   ♣♣♣♣♣   tree### #X#X#X#X#
         ##tele T T T    :::::#####    VVVVV   lava### #2#2#2#2#
         ###key K K K                  =====   pit#### # # # # #
         #power Q Q Q                  XXXXX   block## # # # # #
 #######                                               # # # # #
  2 2  # create ] ] ]         P                        # # # # #
   2   # showge & & &                                  #X#X#X#X#
  2 2  #                  XXXXXXXXXXX                  #3#3#3#3#
 #######                  XXXXXXXXXXX   0 0 0   rock## # # # # #
         ###zap % % %     XXXXXXXXXXX   R L =          # # # # #
         ##slow S S S     XXXXXXXXXXX   < [ | " kroz## # # # # #
         #speed F F F     XXXXXXXXXXX                  # # # # #
 ####### #freez Z Z Z          B        U U U   tunnel #X#X#X#X#
  1 1  # ###inv I I I     ###bomb####                  #########
   1   # tablet ! ! !     #X]1 2 3AX#   . . .   traps#          
  1 1  # #amule ƒ ƒ ƒ     XXXXXXXXXXX   & & &   show##  S       
 ####### ##tome A A A     XDZ/EWLCSVX   E E E   quake#    F     
                          XXXXXXXXXXX   T T T               Z   
`;

// ###gen G G G
// statue > > >

async function onLevelStart() {
  TileChar[Tile.Gem] = FLOOR_CHAR; // HideGems
}

export default {
  id: 'Debug',
  map,
  onLevelStart,
  tabletMessage: 'This is a debug level',
};
