import { default as Stats } from 'stats.js';
import * as dat from 'lil-gui';

import * as controls from './controls';
import * as display from './display';
import * as player from './player-system';
import * as screen from './screen';
import * as world from './world';
import * as mob from './mobs-system';
import * as level from './levels';
import * as effects from './effects-system';
import * as debug from './debug-interface';
import * as events from './events';

import { SHOW_DEBUG_CONTROLS, SHOW_STATS, XMax, YMax } from '../data/constants';
import { Color } from '../data/colors';
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
  await level.loadLevel();

  if (SHOW_STATS && !stats) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  if (SHOW_DEBUG_CONTROLS && !gui) {
    gui = new dat.GUI({
      closeFolders: true,
      title: 'Debug',
    });

    const t = gui.addFolder('Timers');
    t.add(debug.timers, 'SlowTime', 0, 400, 1).listen();
    t.add(debug.timers, 'Invisible', 0, 400, 1).listen();
    t.add(debug.timers, 'SpeedTime', 0, 400, 1).listen();
    t.add(debug.timers, 'FreezeTime', 0, 400, 1).listen();

    const o = gui.addFolder('Objects');
    o.add(debug.stats, 'gems', 0, 400, 1).listen();
    o.add(debug.stats, 'whips', 0, 400, 1).listen();
    o.add(debug.stats, 'keys', 0, 400, 1).listen();
    o.add(debug.stats, 'teleports', 0, 400, 1).listen();
    o.add(debug.stats, 'whipPower', 2, 7, 1).listen();

    const p = gui.addFolder('Player');
    p.add(debug.player, 'x', 0, XMax, 1).listen();
    p.add(debug.player, 'y', 0, YMax, 1).listen();
  }

  screen.fullRender();
  await run();
}

async function run() {
  let tick = 0;
  let dt = 0;
  let previousTime = 0;

  events.levelStart.add(() => {
    tick = 0;
    dt = 0;
    previousTime = 0;
  });

  const raf = async (currentTime: number) => {
    const speed = 8 * world.game.clockScale;

    if (world.game.done) {
      start();
      return;
    }

    dt += currentTime - previousTime;
    previousTime = currentTime;

    stats?.begin();

    if (dt > speed) {
      dt %= speed;
      tick++;

      await player.update();
      await mob.update(tick);
      await effects.update();
      screen.renderPlayfield();
    }

    screen.fastRender(); // TODO: can we only render blink elements?

    stats?.end();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
