// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as state from '../modules/state';

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
  state.level.map.hideType(Type.Create);

  // HideMBlock
  state.level.map.hideType(Type.MBlock);

  //HideOpenWall
  state.level.map.hideType(Type.OWall1);
  state.level.map.hideType(Type.OWall2);
  state.level.map.hideType(Type.OWall3);

  //HideTrap
  state.level.map.hideType(Type.Trap);
}

export default {
  id: 'Lost59',
  map,
  onLevelStart,
  // LavaFlow:=true;LavaRate:=140;
};
