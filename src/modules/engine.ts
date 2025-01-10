import { default as Stats } from 'stats.js';
import * as dat from 'lil-gui';

import * as controls from './controls';
import * as display from './display';
import * as world from './world';
import * as screen from './screen';
import * as state from './state';
import * as scheduler from './scheduler';
import * as level from './levels';

import { DEBUG, XSize, YSize } from '../data/constants';
import { Timer } from './state';
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
  state.resetState();

  await screen.introScreen();
  await world.renderTitle();
  await screen.instructionsScreen();

  level.loadLevel(); // Don't wait
  screen.fullRender();
  await world.flashPlayer();
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
          return state.level.T[Timer.SlowTime];
        },
        set SlowTime(v: number) {
          state.level.T[Timer.SlowTime] = v;
        },
        get Invisible() {
          return state.level.T[Timer.Invisible];
        },
        set Invisible(v: number) {
          state.level.T[Timer.Invisible] = v;
        },
        get SpeedTime() {
          return state.level.T[Timer.SpeedTime];
        },
        set SpeedTime(v: number) {
          state.level.T[Timer.SpeedTime] = v;
        },
        get FreezeTime() {
          return state.level.T[Timer.FreezeTime];
        },
        set FreezeTime(v: number) {
          state.level.T[Timer.FreezeTime] = v;
        },
      };

      const t = gui.addFolder('Timers');
      t.add(timers, 'SlowTime', 0, 400, 1).listen();
      t.add(timers, 'Invisible', 0, 400, 1).listen();
      t.add(timers, 'SpeedTime', 0, 400, 1).listen();
      t.add(timers, 'FreezeTime', 0, 400, 1).listen();

      const o = gui.addFolder('Objects');
      o.add(state.stats, 'gems', 0, 400, 1).listen();
      o.add(state.stats, 'whips', 0, 400, 1).listen();
      o.add(state.stats, 'keys', 0, 400, 1).listen();
      o.add(state.stats, 'teleports', 0, 400, 1).listen();
      o.add(state.stats, 'whipPower', 2, 7, 1).listen();

      const p = gui.addFolder('Player');
      p.add(state.level.player, 'x', 0, XSize, 1).listen();
      p.add(state.level.player, 'y', 0, YSize, 1).listen();
    }
  }

  screen.fullRender();
  await run();
}

async function run() {
  scheduler.createScheduler();

  // Game loop
  let speed = 16 * state.game.clockScale;

  let dt = 0;
  let previousTime = 0;

  const raf = async (currentTime: number) => {
    if (state.stats.gems < 0) {
      await world.dead();
      start();
      return;
    }

    if (state.game.done) {
      start();
      return;
    }

    dt += currentTime - previousTime;
    previousTime = currentTime;

    stats?.begin();

    if (dt > speed) {
      dt %= speed;

      await world.effects();
      await world.playerAction(); // Player acts every tick
      controls.clearActions(); // Clear was pressed actions after player acts

      const current = scheduler.next();
      await world.entitiesAction(current.type);
    }

    screen.fastRender(); // TODO: can we only render blink elements?

    speed = 16 * state.game.clockScale;

    stats?.end();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
