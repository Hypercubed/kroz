import * as world from './world';
import * as screen from './screen';
import * as sound from './sound';

import { XMax, YMax } from '../data/constants';
import { RNG } from 'rot-js';
import { LAVA_FLOW, TREE_GROW, Type } from './tiles';
import { isInvisible } from '../classes/components';
import { Timer } from './effects';

export async function update() {
  // Effect timers
  for (let i = 0; i < world.level.T.length; i++) {
    world.level.T[i] = Math.max(0, world.level.T[i] - 1);
  }

  // Invisible
  if (world.level.T[Timer.Invisible] > 0) {
    world.level.player.add(isInvisible);
  } else {
    world.level.player.remove(isInvisible);
  }

  // Statue Gem Drain
  if (
    world.level.T[Timer.StatueGemDrain] > 0 &&
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
  if (world.level.magicEWalls && RNG.getUniformInt(0, 7) === 0) {
    for (let i = 0; i < 100; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.CWall1) {
        world.setTypeAt(x, y, Type.EWall);
        screen.drawEntityAt(x, y);
        break;
      }
    }
    for (let i = 0; i < 100; i++) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = world.level.map.getType(x, y);
      if (block === Type.EWall) {
        world.setTypeAt(x, y, Type.CWall1);
        screen.drawEntityAt(x, y);
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
        world.setTypeAt(x, y, Type.Floor);
        screen.drawEntityAt(x, y);
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
      if (LAVA_FLOW.includes(block as number)) {
        let done = false;
        if (world.level.map.getType(x + 1, y) === Type.Lava) done = true;
        if (world.level.map.getType(x - 1, y) === Type.Lava) done = true;
        if (world.level.map.getType(x, y + 1) === Type.Lava) done = true;
        if (world.level.map.getType(x, y - 1) === Type.Lava) done = true;
        if (done) {
          world.setTypeAt(x, y, Type.Lava);
          screen.drawEntityAt(x, y);
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
      if (TREE_GROW.includes(block as number)) {
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
          world.setTypeAt(x, y, t);
          screen.drawEntityAt(x, y);
        }
      }
    }
  }
}
