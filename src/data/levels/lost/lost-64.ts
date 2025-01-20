// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import levelData from './lost-64.map.json';

import * as screen from '../../../modules/screen';
import * as sound from '../../../modules/sound';
import * as world from '../../../modules/world';
import * as player from '../../../modules/player';

import { Type } from '../../tiles';
import { XMax, YMax } from '../../constants';

function onLevelStart() {
  world.level.map.updateTilesByType(Type.Fast, { ch: '☺' });
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
  ...levelData,
  onLevelStart,
  tabletMessage,
};
