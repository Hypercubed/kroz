// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import levelData from './lost-42.map.json';

import * as player from '../../../modules/player';
import * as screen from '../../../modules/screen';
import * as world from '../../../modules/world';
import * as sound from '../../../modules/sound';

import { XMax, YMax } from '../../constants';
import { Type } from '../../tiles';

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
  ...levelData,
  tabletMessage,
};
