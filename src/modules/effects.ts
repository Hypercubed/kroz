import * as world from './world';
import * as screen from './screen';
import * as sound from './sound';

import { XMax, YMax } from '../data/constants';
import { RNG } from 'rot-js';
import { Type } from '../data/tiles';
import { isInvisible } from '../classes/components';

export async function update() {
  // Effect timers
  for (let i = 0; i < world.level.T.length; i++) {
    world.level.T[i] = Math.max(0, world.level.T[i] - 1);
  }

  // Invisible
  if (world.level.T[world.Timer.Invisible] > 0) {
    world.level.player.add(isInvisible);
  } else {
    world.level.player.remove(isInvisible);
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
    await world.generateCreatures(1);
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
    for (let i = 0; i < world.level.evapoRate; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.River) {
        world.level.map.setType(x, y, Type.Floor);
        screen.drawEntity(x, y);
        // TODO: Sound
      }
    }
  }

  // Lava Flow
  if (world.level.lavaFlow && RNG.getUniformInt(0, 9) === 0) {
    for (let i = 0; i < world.level.lavaRate; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (
        [
          0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 15, 16, 18, 19, 20, 21, 26, 27, 28,
          32, 33, 34, 35, 37, 38, 39, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51,
          57, 60, 64, 67, 68, 69, 70, 71, 72, 73, 74, 77, 78, 79, 80, 81, 82,
          83,
        ].includes(block as number)
      ) {
        let done = false;
        if (world.level.map.getType(x + 1, y) === Type.Lava) done = true;
        if (world.level.map.getType(x - 1, y) === Type.Lava) done = true;
        if (world.level.map.getType(x, y + 1) === Type.Lava) done = true;
        if (world.level.map.getType(x, y - 1) === Type.Lava) done = true;
        if (done) {
          world.level.map.setType(x, y, Type.Lava);
          screen.drawEntity(x, y);
        }
      }
    }
  }

  // Tree Rate
  if (world.level.treeRate > 0 && RNG.getUniformInt(0, 9) === 0) {
    for (let i = 0; i < world.level.treeRate; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if ([0, 16, 27, 28, 32, 33, 37, 39].includes(block as number)) {
        let done = false;
        if (
          world.level.map.getType(x + 1, y) === Type.Tree ||
          world.level.map.getType(x + 1, y) === Type.Forest
        )
          done = true;
        if (
          world.level.map.getType(x - 1, y) === Type.Tree ||
          world.level.map.getType(x - 1, y) === Type.Forest
        )
          done = true;
        if (
          world.level.map.getType(x, y + 1) === Type.Tree ||
          world.level.map.getType(x, y + 1) === Type.Forest
        )
          done = true;
        if (
          world.level.map.getType(x, y - 1) === Type.Tree ||
          world.level.map.getType(x, y - 1) === Type.Forest
        )
          done = true;
        if (done) {
          const t = RNG.getUniformInt(0, 3) === 0 ? Type.Tree : Type.Forest;
          world.level.map.setType(x, y, t);
          screen.drawEntity(x, y);
        }
      }
    }
  }
}
