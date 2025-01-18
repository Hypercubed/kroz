// Lost Adventures of Kroz, Level 42 by Scott Miller 11/12/89
// Original Source: 1987-1990 Scott Miller

import type { Map } from '@kayahr/tiled';

import levelData from './lost-61.json';

import * as player from '../../../modules/player';
import * as screen from '../../../modules/screen';
import * as world from '../../../modules/world';
import * as levels from '../../../modules/levels';

import { Type } from '../../tiles';
import { Position } from '../../../classes/components';

function onLevelStart() {
  world.level.map.updateTilesByType(Type.Fast, { ch: '☺' });
}

async function tabletMessage() {
  await screen.flashMessage(
    'Walls that block your progress shall be removed...',
  );

  const p = world.level.player.get(Position)!;
  world.level.map.setType(p.x, p.y, Type.OSpell1);
  player.tryMove(0, 0);
}

export default {
  ...levels.readLevelJSON(levelData as unknown as Map),
  onLevelStart,
  tabletMessage,
};
