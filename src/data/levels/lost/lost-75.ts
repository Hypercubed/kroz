// Lost Adventures of Kroz, Level 75 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import * as screen from '../../../modules/screen';
import * as sound from '../../../modules/sound';
import * as world from '../../../modules/world';
import * as player from '../../../modules/player';

import { XMax, YMax } from '../../constants';
import { Type } from '../../tiles';

import map from '../../../../levels/lost/lost-75.txt?raw';

async function onLevelStart() {
  world.level.magicEwalls = true;
  world.level.evapoRate = 22;
  world.level.map.hideType(Type.Create);
}

async function tabletMessage() {
  await player.prayer();
  await screen.flashMessage('"Ttocs Rellim Setalutargnoc Uoy!"');
  await screen.flashMessage(
    'Your palms sweat as the words echo through the chamber...',
  );
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.Pit) {
        await sound.play(x * y, 50, 10);
        world.level.map.setType(x, y, Type.Rock);
        screen.drawEntity(x, y);
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
};
