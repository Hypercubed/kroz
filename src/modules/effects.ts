import * as world from './world';
import * as screen from './screen';
import * as sound from './sound';

import { XMax, YMax } from '../data/constants';
import { delay } from '../utils/utils';
import { RNG } from 'rot-js';
import { Actor } from '../classes/actors';
import { Type } from '../data/tiles';

export async function tick() {
  // Effect timers
  for (let i = 0; i < world.level.T.length; i++) {
    world.level.T[i] = Math.max(0, world.level.T[i] - 1);
  }

  // Statue Gem Drain
  if (
    world.level.T[world.Timer.StatueGemDrain] > 0 &&
    RNG.getUniformInt(0, 18) === 0
  ) {
    world.stats.gems--;
    await sound.play(3800, 40);
    screen.renderStats();
  }

  // Creature generation
  const sNum = world.level.entities.reduce((acc, e) => {
    if (e.type === Type.Slow) return acc + 1;
    return acc;
  }, 0);

  if (
    world.level.genNum > 0 &&
    sNum < 995 &&
    RNG.getUniformInt(0, 17) === 0 // 1 in 17 chance of generating a creature
  ) {
    await generateCreatures();
  }

  // Magic EWalls
  if (world.level.magicEwalls && RNG.getUniformInt(0, 7) === 0) {
    for (let i = 0; i < 100; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.CWall1) {
        world.level.map.setType(x, y, Type.EWall);
        screen.drawEntity(x, y);
        break;
      }
    }
    for (let i = 0; i < 100; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.EWall) {
        world.level.map.setType(x, y, Type.CWall1);
        screen.drawEntity(x, y);
        break;
      }
    }
  }

  // Evaporate
  if (world.level.evapoRate > 0 && RNG.getUniformInt(0, 9) === 0) {
    const x = RNG.getUniformInt(0, XMax);
    const y = RNG.getUniformInt(0, YMax);
    const block = world.level.map.getType(x, y);
    if (block === Type.River) {
      world.level.map.setType(x, y, Type.Floor);
      screen.drawEntity(x, y);
      // TODO: Sound
    }
  }

  // TODO:
  // Lava Flow
  // TreeGrow
}

async function generateCreatures() {
  let done = false;
  do {
    const x = RNG.getUniformInt(0, XMax);
    const y = RNG.getUniformInt(0, YMax);
    if (world.level.map.getType(x, y) === Type.Floor) {
      world.level.entities.push(new Actor(Type.Slow, x, y));
      world.level.map.setType(x, y, Type.Slow);

      for (let i = 5; i < 70; i++) {
        sound.play(i * 8, 1);
      }
      await delay(50);

      done = true;
    }

    screen.renderPlayfield();
  } while (!done && RNG.getUniformInt(0, 50) !== 0);
}
