import { default as Stats } from 'stats.js';
import * as dat from 'lil-gui';

import * as controls from './controls';
import * as display from './display';
import * as world from './world';
import * as screen from './screen';
import * as state from './state';
import * as scheduler from './scheduler';

import { DEBUG, CLOCK_SCALE, XSize, YSize } from './constants';
import { Timer } from './state';
import { Color } from './colors';

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

  world.loadLevel(); // Don't wait
  fullRender();
  await world.flashPlayer();
  fastRender();
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
          return state.state.T[Timer.SlowTime];
        },
        set SlowTime(v: number) {
          state.state.T[Timer.SlowTime] = v;
        },
        get Invisible() {
          return state.state.T[Timer.Invisible];
        },
        set Invisible(v: number) {
          state.state.T[Timer.Invisible] = v;
        },
        get SpeedTime() {
          return state.state.T[Timer.SpeedTime];
        },
        set SpeedTime(v: number) {
          state.state.T[Timer.SpeedTime] = v;
        },
        get FreezeTime() {
          return state.state.T[Timer.FreezeTime];
        },
        set FreezeTime(v: number) {
          state.state.T[Timer.FreezeTime] = v;
        },
      };

      const t = gui.addFolder('Timers');
      t.add(timers, 'SlowTime', 0, 400, 1).listen();
      t.add(timers, 'Invisible', 0, 400, 1).listen();
      t.add(timers, 'SpeedTime', 0, 400, 1).listen();
      t.add(timers, 'FreezeTime', 0, 400, 1).listen();

      const o = gui.addFolder('Objects');
      o.add(state.state, 'gems', 0, 400, 1).listen();
      o.add(state.state, 'whips', 0, 400, 1).listen();
      o.add(state.state, 'keys', 0, 400, 1).listen();
      o.add(state.state, 'teleports', 0, 400, 1).listen();
      o.add(state.state, 'whipPower', 2, 7, 1).listen();

      const p = gui.addFolder('Player');
      p.add(state.state.player, 'x', 0, XSize, 1).listen();
      p.add(state.state.player, 'y', 0, YSize, 1).listen();
    }
  }

  fullRender();
  await run();
}

async function run() {
  scheduler.createScheduler();

  // scheduler.add(PlayerActor, true);
  // scheduler.add(SlowActor, true);
  // scheduler.add(MediumActor, true);
  // scheduler.add(FastActor, true);

  // Game loop
  const speed = 16 * CLOCK_SCALE; // 16 * 8;

  let dt = 0;
  let previousTime = 0;

  const raf = async (currentTime: number) => {
    if (state.state.gems < 0) {
      await world.dead();
      reset();
      return;
    }

    if (state.state.done) {
      reset();
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

    fastRender(); // TODO: can we only render blink elements?

    stats?.end();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function reset() {
  display.clear(Color.Black);
  state.resetState();
  start();
}

export function fullRender() {
  display.clear(Color.Blue);
  screen.renderBorder();
  screen.renderScreen();
  world.renderPlayfield();
  screen.renderStats();
}

export function fastRender() {
  world.renderPlayfield();
  screen.renderStats();
}
