// Lost Adventures of Kroz, Level 75 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import type { Map } from '@kayahr/tiled';

import levelData from './lost-75.json';

import * as screen from '../../../modules/screen';
import * as sound from '../../../modules/sound';
import * as world from '../../../modules/world';
import * as player from '../../../modules/player';
import * as levels from '../../../modules/levels';

import { XMax, YMax } from '../../constants';
import { Type } from '../../tiles';

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
  ...levels.readLevelJSON(levelData as unknown as Map),
  tabletMessage,
};
