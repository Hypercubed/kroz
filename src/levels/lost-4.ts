// Lost Adventures of Kroz, Level 4 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

// import { FLOOR_CHAR } from '../constants';
// import { TileChar, Tile } from '../tiles';

export const id = 'Lost4';

const map = `
                                   1                        1  &
 ####shop####         1                                       ‘ 
 ##++++++++##                            1                      
 ##++++++++##                                 ##4444444444444444
 #####OO#####                                 ##   1   1   1  1 
                          ###spells###        ## 1 1  1  1   1  
     1                    ##ñEF‘Tò @##     1  ##    1   1  1  1 
                          ##I@ ‘S  T##        ##11   1 1    1   
                     1    ##ZóT‘  ] ##        ##   1   1 1  1 1 
                          #########X##        ## 1   1  1  1 1  
@@         1                                  ##1 1    1  1    1
1@W                            P              ## 1  1 1 1  1 1 1
1@W                                           ##1  11  1 1   1  
1@W   1                                     1 ##  1   1     1   
1@W                 1                         ##1    1  1  1  1 
1@W                                     #.#OXX## 1 1  1   1    1
1@W          ###lair#of#kroz###         #.#XOX##1    1  1   1 1 
1@W          77------------ôK##         #.#XXO##  1 1  1   1   1
1@W          ####1111111111####         #.#XOX## 1 1  1 1 1   1 
1@W    1      Z##############           #H#X!X##1  1 1  1  1 1  
1@W                                     ######## 1   1 1  1   1 
1@@@@@@@@@@@@@@@                  ########@       1   1   1 1  1
111111111111111@                1 ##LLWWWD@         1   1    1 1
`;

async function onLevelStart() {
  // Bug: Revealed gems are also hidden
  // TileChar[Tile.Gem] = FLOOR_CHAR; // HideGems
}

export default {
  id: 'Lost4',
  map,
  onLevelStart,
  tabletMessage: 'Adventurer, try the top right corner if you desire.',
};

// TODO:
// ZBlock?  TBlock
