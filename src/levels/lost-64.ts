// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as screen from '../modules/screen';
import * as sound from '../modules/sound';
import * as world from '../modules/world';
import * as player from '../modules/player';

import { Type } from '../data/tiles';
import { XMax, YMax } from '../data/constants';

const map = `
3333333333333333333333333333333333333333333333333333##C33à)))Fàó
4444444444444444444444444444444444444444444444444444##333à))F)àà
LL@@@@;@@@@@@@F@@;@@@@@@@@F@@@;@@@@@@@@@F@@@@@@@@@@@##333à))))F)
LL@;@@@@F@@;@@@@@@@@F@@;@@@@F@@@@@F@@@;@@@@@F@@@;@F@##333à)F))))
#########################@@@;@@@F@@;@@F@@@@F@@@F@@@@##333à)))F))
  æ        ááá      YY>##&@@@@F@;@@@F@@@F@@;@F@”””””##333à)F))))
88~  ææ##-##3á      YYY#########################ññññ##333à))))F)
Mõ~  æ3## ##3á              D‘‘F‘‘D77777777777##6666#####àFFFFFF
Mõ~  æ3##S##3ááááááááááá P  #######77777777777##ããããâ33##Tàààààà
Mõ~  æ3##F##33333333333á   +##’K’##77777777777##ããããâââ####YYY##
Mõ~ææææ#######################(((##77777777777--ããããããããããâããããã
Mõ~    ä333333333WWWä  ää999##’’’###############################
Mõ~    ääääääääääääää  ##MMM##(((##33333333333333333333333333333
Mõ~                   ’##MOM##(((##33333333333333333333333333333
Mõ~           —     #####OMO##’’’##33333333333333333333333333333
Mõ~               ää##K##MOM##(((##(((((((((((((((((((((((((((((
Mõ~   —          ää3##ä##OMO##((((((((((((((((((((((((((((((((((
Mõ~             ää33##-##MOM##(YY++YY((YYYYY+((+YYYY+(YYYYYYY(((
XX~            ää333##-##OMO##(YY+YY+((YY++YY((YY++YY(++++YY+(((
XX~ çççççç —  ää3333##’##MOM##(YYYY++((YYYYY+((YY++YY(+++YY++(((
XX~ ç3333ç    ä3333C##-##OUO##(YYYY++((YY+YY+((YY++YY(++YY+++(((
XX~ ##################-#######(YY+YY+((YY++YY((YY++YY(+YY++++(((
X!~     ççççç          äää~H##(YY++YY((YY++YY((+YYYY+(YYYYYYY((U
`;

function onLevelStart() {
  world.level.map.updateEntities(Type.Fast, { ch: '☺' });
}

async function tabletMessage() {
  await player.prayer();
  await screen.flashMessage('"Tnarg yna rerutnevda ohw sevivrus siht raf..."');
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.CWall1) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Nugget);
        // ArtColor??
        screen.drawEntity(x, y);
      }
    }
  }
  await screen.flashMessage('"...Dlog!"');
}

export default {
  id: 'Lost64',
  map,
  onLevelStart,
  tabletMessage,
};
