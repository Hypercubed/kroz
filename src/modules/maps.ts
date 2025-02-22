import { Map as RotMap } from 'rot-js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import NewDungeon from 'random-dungeon-generator';

import * as world from './world';
import * as effects from './effects';

import { XMax, YMax } from '../constants/constants';
import { Type } from '../constants/types';

export async function ellerMaze(type: Type) {
  const em = new RotMap.EllerMaze(XMax + 4, YMax + 3);
  em.create((x, y, value) => {
    x--;
    y--;
    // if (x < 0 || x > XMax || y < 0 || y > YMax) return;
    if (value && world.level.map.getType(x, y) === Type.Floor) {
      effects.become(type, x, y);
    }
  });
}

export async function cellular(type: Type) {
  const c = new RotMap.Cellular(XMax + 1, YMax + 1);
  c.randomize(0.5);
  for (let i = 0; i < 4; i++) c.create();

  c.connect((x, y, value) => {
    if (x < 0 || x > XMax || y < 0 || y > YMax) return;
    if (!value && world.level.map.getType(x, y) === Type.Floor) {
      effects.become(type, x, y);
    }
  }, 1);
}

export async function rogue(type: Type) {
  const r = new RotMap.Rogue(XMax + 1, YMax + 1, {});
  r.create((x, y, value) => {
    if (x < 0 || x > XMax || y < 0 || y > YMax) return;
    if (value && world.level.map.getType(x, y) === Type.Floor) {
      effects.become(type, x, y);
    }
  });
}

export async function bsp(type: Type) {
  const d = NewDungeon({
    width: XMax + 3,
    height: YMax + 5,
    minRoomSize: 3,
    maxRoomSize: 100
  });

  for (let y = 1; y < d.length - 1; y++) {
    for (let x = 1; x < d[y].length - 1; x++) {
      const [xx, yy] = [x - 1, y - 1];
      if (world.level.map.getType(xx, yy) === Type.Floor) {
        if (d[y][x] === 1) {
          effects.become(type, xx, yy);
        }
        // if (d[y][x] === 0) {
        //   effects.become(Type.Block, xx, yy);
        // }
      }
    }
  }
}
