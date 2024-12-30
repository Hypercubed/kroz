import { RNG, Scheduler } from 'rot-js';

import * as controls from './controls';
import * as display from './display';
import * as world from './world';
import * as sound from './sound';
import * as screen from './screen';

import { Tile } from './tiles';
import { Timer } from './world';

// Dummy entities used for the scheduler
const PlayerActor = { type: Tile.Player, getSpeed: () => 30 };
const SlowActor = { type: Tile.Slow, getSpeed: () => 10 * world.getTimeScale() };
const MediumActor = { type: Tile.Medium, getSpeed: () => 20 * world.getTimeScale() };
const FastActor = { type: Tile.Fast, getSpeed: () => 30 * world.getTimeScale() };

export async function start() {
  const scheduler = new Scheduler.Speed();

  controls.start();

  await renderTitle();

  world.loadLevel(); // Don't wait
  screen.render();
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

  screen.render();

  // Game loop
  const speed = 80;

  let dt = 0;
  let previousTime = 0;

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

    dt += (currentTime - previousTime);
    previousTime = currentTime;

    world.state.T = world.state.T.map((t) => (t > 0 ? t - 1 : 0));

    if (dt > speed) {
      dt %= speed;
      if (!world.state.paused) {
        const current = scheduler.next();
        await world.action(Tile.Player);
        if (world.state.T[Timer.FreezeTime] < 1) { // Freeze time spell active
          await world.action(current.type);
        }
        world.renderPlayfield();
        screen.renderStats();
      }
    }

    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

async function renderTitle() {
  display.bak(1);

  display.gotoxy(1, 9);
  display.col(11);
  display.writeln(
    `  In your search for the priceless Amulet within the ancient Caverns of Kroz,`,
  );
  display.writeln(
    `  you have stumbled upon a secret passage leading deep into the Earth.   With`,
  );
  display.writeln(
    `  your worn lantern you descend into the misty depths,  sweat beading on your`,
  );
  display.writeln(
    `  forehead as you realize the peril that awaits.   If this is really the path`,
  );
  display.writeln(
    `  leading into the great underground caverns you'll find unimaginable wealth.`,
  );

  display.gotoxy(23);
  display.writeln('But only if you can reach it alive!');

  display.gotoxy(27, 25);
  display.col(12);
  display.write('Press any key to continue.');

  controls.clearKeys();
  while (!controls.anyKey()) {
    display.gotoxy(34, 3);
    display.col(RNG.getUniformInt(0, 16));
    display.write('CAVERNS OF KROZ');
    await sound.delay(50);

    // await sound.play(300, 100);
    await sound.delay(100);
  }
  controls.clearKeys();
}

function reset() {
  display.clear();
  world.resetState();
  start();
}
