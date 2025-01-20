// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import levelData from './lost-52.map.json';

import * as world from '../../../modules/world';

import { Type } from '../../tiles';
import { Color } from '../../colors';

async function onLevelStart() {
  // Change floor character
  world.level.map.updateTilesByType(Type.Floor, {
    ch: '.',
    fg: Color.Brown,
    bg: Color.Black,
  });

  // HideCreate
  world.level.map.hideType(Type.Create);

  // HideMBlock
  world.level.map.hideType(Type.MBlock);
}

export default {
  ...levelData,
  onLevelStart,
  tabletMessage: 'Up 4 steps, then left 16 steps.',
};
