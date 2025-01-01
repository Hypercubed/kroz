import * as display from './display';
import * as world from './world';
import * as controls from './controls';

import { FLOOR_CHAR, XBot, XTop, YBot, YTop } from './constants';
import { RNG } from 'rot-js';
import { Color } from './colors';
import { delay } from './utils';

export function renderScreen() {
  display.col(14);
  display.bak(Color.Blue);
  const x = 70;
  display.print(x, 0, 'Score');
  display.print(x, 3, 'Level');
  display.print(x, 6, 'Gems');
  display.print(x, 9, 'Whips');
  display.print(x - 2, 12, 'Teleports');
  display.print(x, 15, 'Keys');
}

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST1.LEV#L328
export function renderStats() {
  const whipStr =
    world.state.whipPower > 2
      ? `${world.state.whips}+${world.state.whipPower - 2}`
      : world.state.whips.toString();

  const width = 4;
  const size = 7;

  const gc =
    !world.state.paused && world.state.gems < 10 ? Color.Red | 16 : Color.Red;

  const x = 69;

  display.drawText(
    x,
    1,
    pad((world.state.score * 10).toString(), width + 1, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    4,
    pad(world.state.level.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    7,
    pad(world.state.gems.toString(), width + 1, size),
    gc,
    Color.Grey,
  );
  display.drawText(x, 10, pad(whipStr, width, size), Color.Red, Color.Grey);
  display.drawText(
    x,
    13,
    pad(world.state.teleports.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    x,
    16,
    pad(world.state.keys.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
}

export function fullRender() {
  display.clear();
  renderBorder();
  renderScreen();
  world.renderPlayfield();
  renderStats();
}

export function fastRender() {
  world.renderPlayfield();
  renderStats();
}

export function renderBorder() {
  display.col(Color.LightBlue);
  display.bak(Color.Black);

  for (let x = XBot - 1; x <= XTop + 1; x++) {
    display.draw(x, 0, '▒');
    display.draw(x, YTop + 1, '▒');
  }
  for (let y = YBot - 1; y <= YTop + 1; y++) {
    display.draw(0, y, '▒');
    display.draw(XTop + 1, y, '▒');
  }
}

export async function flashMessage(msg: string): Promise<string> {
  if (!msg) return '';

  const x = (XTop - msg.length) / 2;
  const y = YTop + 1;

  world.state.paused = true;
  const readkey = controls.readkey();
  while (!readkey()) {
    display.drawText(x, y, msg, RNG.getUniformInt(1, 15), Color.Black);
    await delay(50);
  }
  renderBorder();
  controls.clearKeys();

  world.state.paused = false;

  return readkey();
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, FLOOR_CHAR).padEnd(r, FLOOR_CHAR);
}
