import { default as Stats } from 'stats.js';
import * as dat from 'lil-gui';

import * as controls from './controls';
import * as display from './display';
import * as player from '../systems/player-system';
import * as screen from './screen';
import * as world from './world';
import * as mob from '../systems/mobs-system';
import * as level from './levels';
import * as effects from '../systems/effects-system';
import * as debug from './debug';
import * as events from './events';
import * as tiles from './tiles';
import * as colors from './colors';

import {
  SHOW_DEBUG_CONTROLS,
  SHOW_STATS,
  TITLE,
  XMax,
  YMax
} from '../constants/constants';
import { Color } from './colors';
import { games } from './games';

let stats: Stats;
let gui: dat.GUI;

let lastRaf = 0;
let runningGame = 0;

export function init() {
  const container = display.getContainer()!;
  const app = document.getElementById('app')!;

  app.appendChild(container);
  controls.start();

  world.resetState();
  display.clear(Color.Black);

  if (SHOW_STATS && !stats) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  if (SHOW_DEBUG_CONTROLS && !gui) {
    gui = new dat.GUI({
      closeFolders: true,
      title: 'Debug'
    });

    // TODO: Move this to debug module
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

    const l = gui.addFolder('Level');
    l.add(debug.levels, 'level', 0, 100, 1).listen();

    const p = gui.addFolder('Player');
    p.add(debug.player, 'bot').listen();
    p.add(debug.player, 'x', 0, XMax, 1).listen();
    p.add(debug.player, 'y', 0, YMax, 1).listen();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events.gameStart.add((game: any) => {
    window.cancelAnimationFrame(lastRaf);
    runGame(game);
  });
}

export async function start() {
  runningGame = 0;
  display.clear(Color.Black);

  await screen.introScreen();
  world.gameState.title = TITLE;
  events.gameStart.dispatch(games.loading);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runGame(game: any) {
  world.resetState();
  world.gameState.currentGame = game;

  display.clear(Color.Black);

  if (runningGame++ > 0) {
    await screen.renderTitle();
  }

  tiles.setTileset(await game.readTileset());
  colors.setColors(await game.readColor());

  await level.loadLevel(0);

  screen.fullRender();

  world.gameState.started = true;
  await run();
}

async function run() {
  const _runningGame = runningGame;
  let tick = 0;
  let dt = 0;
  let previousTime = 0;

  events.levelStart.add(() => {
    tick = 0;
    dt = 0;
    previousTime = 0;
  });

  const raf = async (currentTime: number) => {
    if (runningGame !== _runningGame) return;

    const speed = 8 * world.gameState.clockScale;

    if (world.gameState.done) {
      // Remote this?
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
      if (runningGame !== _runningGame) return;

      await mob.update(tick);
      await effects.update();
      screen.renderPlayfield();
    }

    screen.fastRender(); // TODO: can we only render blink elements?

    stats?.end();
    requestAnimationFrame(raf);
  };
  lastRaf = requestAnimationFrame(raf);
}
