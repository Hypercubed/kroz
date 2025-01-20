// Lost Adventures of Kroz, Level 26 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import levelData from './lost-26.map.json';

import * as screen from '../../../modules/screen';
import * as sound from '../../../modules/sound';
import * as world from '../../../modules/world';

import { XMax, YMax } from '../../constants';
import { Type } from '../../tiles';

async function tabletMessage() {
  await screen.flashMessage(
    `No one has ever made it to the ${world.stats.levelIndex} level!`,
  );
  await screen.flashMessage(
    'You have shown exceptional skills to reach this far...',
  );
  await screen.flashMessage('Therefore I grant you the power to see...');

  // Show IWalls
  for (let x = 0; x <= XMax; x++) {
    for (let y = 0; y <= YMax; y++) {
      if (world.level.map.getType(x, y) === Type.IWall) {
        await sound.play(x * y, 1, 10);
        world.level.map.setType(x, y, Type.OWall3);
        screen.drawEntity(x, y);
      }
    }
  }

  await screen.flashMessage('Behold...your path awaits...');
}

export default {
  ...levelData,
  tabletMessage,
};
