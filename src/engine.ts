import { Scheduler } from 'rot-js';
import { default as Stats } from 'stats.js';
import * as dat from 'lil-gui';

import * as controls from './controls';
import * as display from './display';
import * as world from './world';
import * as screen from './screen';
import * as state from './state';

import { Tile } from './tiles';
import { DEBUG, TIME_SCALE, XSize, YSize } from './constants';
import { Timer } from './state';
import { Color } from './colors';

let stats: Stats;
let gui: dat.GUI;

const PT = TIME_SCALE;
const ST = TIME_SCALE / 4;
const MT = TIME_SCALE / 3;
const FT = TIME_SCALE / 2;

// Dummy entities used for the scheduler
const PlayerActor = { type: Tile.Player, getSpeed: () => 1 };
const SlowActor = {
  type: Tile.Slow,
  getSpeed: () => {
    if (state.state.T[Timer.SlowTime] > 0) return ST / 5;
    if (state.state.T[Timer.SpeedTime] > 0) return PT;
    return ST;
  },
};
const MediumActor = {
  type: Tile.Medium,
  getSpeed: () => {
    if (state.state.T[Timer.SlowTime] > 0) return MT / 5;
    if (state.state.T[Timer.SpeedTime] > 0) return PT;
    return MT;
  },
};
const FastActor = {
  type: Tile.Fast,
  getSpeed: () => {
    if (state.state.T[Timer.SlowTime] > 0) return (FT / 5) * TIME_SCALE;
    if (state.state.T[Timer.SpeedTime] > 0) return PT * TIME_SCALE;
    return FT * TIME_SCALE;
  },
};

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

  // for (let i = 0; i < 80; i++) {
  //   display.gotoxy(state.state.player.x + XBot, state.state.player.y + YBot);
  //   display.col(RNG.getUniformInt(0, 15));
  //   display.bak(RNG.getUniformInt(0, 8));
  //   display.write(TileChar[Tile.Player]);
  //   await delay(1);
  //   sound.play(i / 2, 1000, 30);
  // }

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
  const scheduler = new Scheduler.Speed();

  scheduler.add(PlayerActor, true);
  scheduler.add(SlowActor, true);
  scheduler.add(MediumActor, true);
  scheduler.add(FastActor, true);

  // Game loop
  const speed = 16 * 8;

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
