// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import { FLOOR_CHAR } from '../data/constants';
import { TileChar, Tile } from '../data/tiles';

const map = `
##########K]K-WWWWñD          00%00         D’D”D‘&&LL##########
##VVVVVV############          00000    .    ############VVVVVV##
##VVVVVV44                                            44VVVVVV##
##VVVVVV44      .      .                        .     44VVVVVV##
#####44444                               )            44444#####
MMMM(                           P  .                       )MMMM
MMMM(                   (                                  )MMMM
MMMM(         .                                   (        )MMMM
MMMM(                                 .                    )MMMM
MMMM(                      44444444444                 .   )MMMM
MMMM(                      44VVVVVVV44                     )MMMM
CMMM(   .                  44VVVGVVV44       .             )MMMC
MMMM(          )       .   44VVVVVVV44                     )MMMM
MMMM(                      44444444444                     )MMMM
MMMM(                                           )          )MMMM
MMMM(                                   .                  )MMMM
MMMM(     .       .                                .       )MMMM
MMMM(                                                      )MMMM
#####44444                     .            .         44444#####
##VVVVVV44         (                     (            44VVVVVV##
##VVVVVV44                 )                          44VVVVVV##
##VVVVVV############          00000  .      ############VVVVVV##
##########K]-WWWWWWñ          00C00         D-D--K-K]K##########
`;

async function onLevelStart() {
  TileChar[Tile.Create] = FLOOR_CHAR;
  TileChar[Tile.MBlock] = FLOOR_CHAR;

  TileChar[Tile.OWall1] = FLOOR_CHAR;
  TileChar[Tile.OWall2] = FLOOR_CHAR;
  TileChar[Tile.OWall3] = FLOOR_CHAR;

  TileChar[Tile.Trap] = FLOOR_CHAR;
}

export default {
  id: 'Lost59',
  map,
  onLevelStart,
  // LavaFlow:=true;LavaRate:=140;
};
