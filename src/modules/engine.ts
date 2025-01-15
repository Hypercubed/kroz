import { default as Stats } from 'stats.js';
import * as dat from 'lil-gui';

import * as controls from './controls';
import * as display from './display';
import * as player from './player';
import * as screen from './screen';
import * as world from './world';
import * as mob from './mobs';
import * as level from './levels';
import * as effects from './effects';

import { DEBUG, XMax, YMax } from '../data/constants';
import { Timer } from './world';
import { Color } from '../data/colors';
import { Position } from '../classes/components';

let stats: Stats;
let gui: dat.GUI;

export function init() {
  const container = display.getContainer()!;
  const app = document.getElementById('app')!;
  app.appendChild(container);
  controls.start();
}

export async function start() {
  display.clear(Color.Black);
  world.resetState();

  await screen.introScreen();
  await screen.renderTitle();
  await screen.instructionsScreen();

  level.loadLevel(); // Don't wait
  screen.fullRender();
  await player.flashPlayer();
  screen.fastRender();
  await screen.flashMessage('Press any key to begin this level.');
  controls.clearActions();

  if (DEBUG) {
    if (!stats) {
      stats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);
    }

    if (!gui) {
      gui = new dat.GUI({
        closeFolders: true,
        title: 'Debug',
      });

      const timers = {
        get SlowTime() {
          return world.level.T[Timer.SlowTime];
        },
        set SlowTime(v: number) {
          world.level.T[Timer.SlowTime] = v;
        },
        get Invisible() {
          return world.level.T[Timer.Invisible];
        },
        set Invisible(v: number) {
          world.level.T[Timer.Invisible] = v;
        },
        get SpeedTime() {
          return world.level.T[Timer.SpeedTime];
        },
        set SpeedTime(v: number) {
          world.level.T[Timer.SpeedTime] = v;
        },
        get FreezeTime() {
          return world.level.T[Timer.FreezeTime];
        },
        set FreezeTime(v: number) {
          world.level.T[Timer.FreezeTime] = v;
        },
      };

      const t = gui.addFolder('Timers');
      t.add(timers, 'SlowTime', 0, 400, 1).listen();
      t.add(timers, 'Invisible', 0, 400, 1).listen();
      t.add(timers, 'SpeedTime', 0, 400, 1).listen();
      t.add(timers, 'FreezeTime', 0, 400, 1).listen();

      const o = gui.addFolder('Objects');
      o.add(world.stats, 'gems', 0, 400, 1).listen();
      o.add(world.stats, 'whips', 0, 400, 1).listen();
      o.add(world.stats, 'keys', 0, 400, 1).listen();
      o.add(world.stats, 'teleports', 0, 400, 1).listen();
      o.add(world.stats, 'whipPower', 2, 7, 1).listen();

      const p = gui.addFolder('Player');
      p.add(world.level.player.get(Position)!, 'x', 0, XMax, 1).listen();
      p.add(world.level.player.get(Position)!, 'y', 0, YMax, 1).listen();
    }
  }

  screen.fullRender();
  await run();
}

async function run() {
  mob.init();

  // Game loop
  let speed = 16 * world.game.clockScale;

  let dt = 0;
  let previousTime = 0;

  const raf = async (currentTime: number) => {
    if (world.stats.gems < 0) {
      await player.dead();
      start();
      return;
    }

    if (world.game.done) {
      start();
      return;
    }

    dt += currentTime - previousTime;
    previousTime = currentTime;

    stats?.begin();

    if (dt > speed) {
      dt %= speed;

      await player.update();
      await mob.update();
      await effects.update();
      screen.renderPlayfield();

      controls.clearActions(); // Clear was pressed actions after player acts
    }

    screen.fastRender(); // TODO: can we only render blink elements?

    speed = 16 * world.game.clockScale;

    stats?.end();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
