// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as player from '../modules/player';
import * as screen from '../modules/screen';
import * as world from '../modules/world';

import { TypeChar, Type } from '../data/tiles';
import { Entity } from '../classes/entity';

const map = `
     U--2--U--2--U--2--U--2--U--55-====-===--=====-===--==--=--=
 #######-#####-#####-#####-#######=-==-=-=-==--==-=-=-==--==-==-
 ######-B-###-B-###-B-###-B-######==--===-=====--===W==========-
 ########chamber#of#horror########======================-------=
 ##22222222222222222222222222##ó##=---=-=-=-==--==--=---========
 ##22222222222222222222222222222##-===-=-=-=--==-=-=-=====-----=
 ##22222222222222222222222########=-============-=-===----=====-
 ##2222222222222222222222266"0LL##-==-=-=-W-====-==---======---=
 ####-############################=--=-=-===-===-========---====
      ##---##ãOOOOOOOOO33333333!##=========-====-====----===-===
########---##H####################==----====-====-”--========--ò
<F  22##111##ãã333333##3333333-[##=-====-==-============--======
FF  22##âââ##ãã333333##3333333--##-===-==-==------=====-==-=--==
    22##YYY##ãã333333##333333333##-==-=-==-=======-===-====-==-=
 P  22##ááá##ã#########444444444##=--==-==W======-===-========-=
    22##111##        ##         ##=====-===------===-==---=-===-
    22##ààà######### ##   ##‘   ##=--==-============-=-===-=---=
    22##             ##   ‘##   ##-==W==-=====---===-==--=======
    22##   ~~~~~  ## ##   ##–   ##=-==-==-===-===--==-===W=----=
    22##   ~~%~~  ## ##   •##   ##==-==-==---==-===--==-==-====-
    22##   ~~0~~  ## ##   ##‘   ##===-=-======-=--====-=-=====-=
    22##ô  ~~0~~  ## ##   ‘##   ##=-=-==-=-==-==-=--==-=-==-===-
      77ô  ~~     ##      ##“   44-=-====-=--==|====--===--=---=
`;

function onLevelStart() {
  TypeChar[Type.Fast] = '☺';
  world.level.map.replaceEntities(Type.Fast, new Entity(Type.Fast));
}

async function tabletMessage() {
  await screen.flashMessage(
    'Walls that block your progress shall be removed...',
  );
  world.level.map.setType(
    world.level.player.x,
    world.level.player.y,
    Type.OSpell1,
  );
  player.tryMove(0, 0);
}

export default {
  id: 'Lost61',
  map,
  onLevelStart,
  tabletMessage,
};
