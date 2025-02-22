import { Map as RotMap } from 'rot-js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import NewDungeon from 'random-dungeon-generator';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Rogue } from 'procedural-layouts';

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
    if (value && world.levelState.map.getType(x, y) === Type.Floor) {
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
    if (!value && world.levelState.map.getType(x, y) === Type.Floor) {
      effects.become(type, x, y);
    }
  }, 1);
}

export async function rogue(type: Type) {
  const r = new RotMap.Rogue(XMax + 1, YMax + 1, {});
  r.create((x, y, value) => {
    if (x < 0 || x > XMax || y < 0 || y > YMax) return;
    if (value && world.levelState.map.getType(x, y) === Type.Floor) {
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
      if (world.levelState.map.getType(xx, yy) === Type.Floor) {
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

export async function brogue(type: Type) {
  const level = new Rogue({
    width: XMax + 1,
    height: YMax + 1,
    retry: 100,
    special: true,
    room: {
      ideal: 35,
      min_width: 3,
      max_width: 7,
      min_height: 3,
      max_height: 7
    }
  });

  const data = level.build().world;

  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (world.levelState.map.getType(x, y) === Type.Floor) {
        const t = data[y][x] ?? 0;

        switch (t) {
          case 0: // Void
            effects.become(Type.Block, x, y);
            break;
          case 1: // Floor
          case 3: // DOOR
            break;
          case 4: // SPECIAL DOOR
            effects.become(Type.Door, x, y);
            break;
          case 2: // Wall
            effects.become(type, x, y);
            break;
          case 5: // Enter
            effects.become(Type.Player, x, y);
            break;
          case 6: // Exit
            effects.become(Type.Stairs, x, y);
            break;
        }
      }
    }
  }

  world.reindexMap();
}
