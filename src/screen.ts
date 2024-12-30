import * as display from './display';
import * as world from './world';
import * as controls from './controls';
import * as sound from './sound';

import { FLOOR_CHAR, XBot, XTop, YBot, YTop } from './constants';
import { TileMessage } from './tiles';
import { RNG } from 'rot-js';
import { Color } from './colors';

export function renderScreen() {
  display.col(14);
  display.bak(Color.Blue);
  display.print(71, 1, 'Score');
  display.print(71, 4, 'Level');
  display.print(71, 7, 'Gems');
  display.print(71, 10, 'Whips');
  display.print(69, 13, 'Teleports');
  display.print(71, 16, 'Keys');
}

// https://github.com/tangentforks/kroz/blob/5d080fb4f2440f704e57a5bc5e73ba080c1a1d8d/source/LOSTKROZ/MASTER2/LOST1.LEV#L328
export function renderStats() {
  const whipStr =
    world.state.whipPower > 2
      ? `${world.state.whips}+${world.state.whipPower - 2}`
      : world.state.whips.toString();

  const width = 4;
  const size = 8;

  const gc =
    !world.state.paused && world.state.gems < 10 ? Color.Red | 16 : Color.Red;

  display.drawText(
    70,
    2,
    pad((world.state.score * 10).toString(), width + 1, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    70,
    5,
    pad(world.state.level.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    70,
    8,
    pad(world.state.gems.toString(), width, size),
    gc,
    Color.Grey,
  );
  display.drawText(70, 11, pad(whipStr, width, size), Color.Red, Color.Grey);
  display.drawText(
    70,
    14,
    pad(world.state.teleports.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
  display.drawText(
    70,
    17,
    pad(world.state.keys.toString(), width, size),
    Color.Red,
    Color.Grey,
  );
}

export function render() {
  display.clear();
  renderBorder();
  renderScreen();
  world.renderPlayfield();
  renderStats();
}

export function renderBorder() {
  display.col(7);
  display.bak(0);

  for (let x = XBot - 1; x <= XTop + 1; x++) {
    display.draw(x, 0, '▒');
    display.draw(x, YTop + 1, '▒');
  }
  for (let y = YBot - 1; y <= YTop + 1; y++) {
    display.draw(0, y, '▒');
    display.draw(XTop + 1, y, '▒');
  }
}

export async function flash(msg: string | number, once = false) {
  if (once) {
    if (world.state.foundSet.has(msg)) return;
    world.state.foundSet.add(msg);
  }

  if (typeof msg === 'number') {
    msg = TileMessage[msg];
  }

  if (!msg) return;

  world.state.paused = true;
  renderScreen();

  controls.clearKeys();
  while (!controls.anyKey()) {
    message(msg, RNG.getUniformInt(1, 15));
    await sound.delay(50);
  }
  renderBorder();
  controls.clearKeys();
  world.state.paused = false;
}

export function message(
  msg: string | number,
  fg?: string | Color,
  bg?: string | Color,
) {
  if (typeof msg === 'number') {
    msg = TileMessage[msg];
  }
  if (!msg) return;

  const x = (XTop - msg.length) / 2;
  const y = YTop + 1;

  bg = bg ?? Color.Black;
  fg = fg ?? Color.HighIntensityWhite;

  display.drawText(x, y, msg, fg, bg);
}

function pad(s: string, n: number, r: number) {
  return s.padStart(n, FLOOR_CHAR).padEnd(r, FLOOR_CHAR);
}
