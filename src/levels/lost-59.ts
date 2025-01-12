// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as world from '../modules/world';

import { Type } from '../data/tiles';

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
  // HideCreate
  world.level.map.hideType(Type.Create);

  // HideMBlock
  world.level.map.hideType(Type.MBlock);

  //HideOpenWall
  world.level.map.hideType(Type.OWall1);
  world.level.map.hideType(Type.OWall2);
  world.level.map.hideType(Type.OWall3);

  //HideTrap
  world.level.map.hideType(Type.Trap);
}

export default {
  id: 'Lost59',
  map,
  onLevelStart,
  // LavaFlow:=true;LavaRate:=140;
};
