import { Scheduler } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as world from './world';
import * as screen from './screen';

import { Tile } from './tiles';
import { DEBUG, HEIGHT, WIDTH } from './constants';
import { Timer } from './world';

// Dummy entities used for the scheduler
const PlayerActor = { type: Tile.Player, getSpeed: () => 10 };
const SlowActor = {
  type: Tile.Slow,
  getSpeed: () => 1 * world.getTimeScale(),
};
const MediumActor = {
  type: Tile.Medium,
  getSpeed: () => 2 * world.getTimeScale(),
};
const FastActor = {
  type: Tile.Fast,
  getSpeed: () => 3 * world.getTimeScale(),
};

export async function start() {
  const scheduler = new Scheduler.Speed();

  controls.start();

  await screen.renderTitle();

  world.loadLevel(); // Don't wait
  screen.fullRender();
  await world.flashPlayer();

  // for (let i = 0; i < 80; i++) {
  //   display.gotoxy(world.state.player.x + XBot, world.state.player.y + YBot);
  //   display.col(RNG.getUniformInt(0, 15));
  //   display.bak(RNG.getUniformInt(0, 8));
  //   display.write(TileChar[Tile.Player]);
  //   await sound.delay(1);
  //   sound.play(i / 2, 1000, 30);
  // }

  scheduler.add(PlayerActor, true);
  scheduler.add(SlowActor, true);
  scheduler.add(MediumActor, true);
  scheduler.add(FastActor, true);

  screen.fullRender();

  // Game loop
  const speed = 16 * 8;

  let dt = 0;
  let previousTime = 0;
  let fps = 0;

  const raf = async (currentTime: number) => {
    if (world.state.gems < 0) {
      await world.dead();
      reset();
      return;
    }

    if (world.state.done) {
      reset();
      return;
    }

    const DT = currentTime - previousTime;
    dt += currentTime - previousTime;
    fps = 1000 / DT;
    previousTime = currentTime;

    if (dt > speed) {
      dt %= speed;
      if (!world.state.paused) {
        await world.effects();
        await world.playerAction(); // Player acts every tick
        const current = scheduler.next();
        await world.entitiesAction(current.type);
      }

      if (DEBUG) {
        display.drawText(
          WIDTH - 10,
          HEIGHT - 4,
          'fps: ' + fps.toFixed(),
          'white',
          'black',
        );

        const e = [
          world.state.T[Timer.SlowTime],
          world.state.T[Timer.Invisible],
          world.state.T[Timer.SpeedTime],
          world.state.T[Timer.FreezeTime],
        ];
        display.drawText(
          WIDTH - 12,
          HEIGHT - 2,
          e.toString(),
          'white',
          'black',
        );
      }
    }

    screen.fastRender();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function reset() {
  display.clear();
  world.resetState();
  start();
}
