import { default as Display } from 'rot-js/lib/display/display';

import * as colors from './colors';

import { HEIGHT, WIDTH } from '../constants/constants';
import { Color } from './colors';

let rotDisplay: Display;

export function init() {
  Display.Rect.cache = true;

  rotDisplay = new Display({
    width: WIDTH,
    height: HEIGHT,
    fontFamily: 'IBM_VGA, monospace',
    bg: colors.getColor(Color.Black), // background
    fg: colors.getColor(Color.White), // foreground
    fontSize: 64 // canvas fontsize,
  });

  const originalDrawOver = rotDisplay.drawOver;
  rotDisplay.drawOver = function (x, y, ch, fg, bg) {
    originalDrawOver.call(this, x, y, ch, fg, bg);
    if (this._dirty === true) {
      return;
    } // will already redraw everything
    if (!this._dirty) {
      this._dirty = {};
    } // first!
    this._dirty[`${x},${y}`] = true;
  };

  // const container = rotDisplay.getContainer();
  // container?.addEventListener('click', e => {
  //   console.log(rotDisplay.eventToPosition(e));
  // });
}

export function debug(x: number, y: number, n: number) {
  rotDisplay.DEBUG(x, y, n);
}

export function writeCenter(
  y: number,
  s: string,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg
) {
  const x = Math.floor((WIDTH - s.length) / 2);
  drawText(x, y, s, ...colors.getColors(fg, bg));
}

export function clearLine(
  y: number,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg
) {
  drawText(0, y, ' '.repeat(WIDTH), ...colors.getColors(fg, bg));
}

export function clear(bg: string | Color = rotDisplay.getOptions().bg) {
  rotDisplay.setOptions({ bg: colors.getColor(bg) });
  rotDisplay.clear();
}

export function draw(
  x: number,
  y: number,
  ch: string | null,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg
) {
  rotDisplay.draw(x, y, ch, ...colors.getColors(fg, bg));
}

export function drawOver(
  x: number,
  y: number,
  ch: string | null,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg
) {
  rotDisplay.drawOver(x, y, ch, ...colors.getColors(fg, bg));
}

export function drawText(
  x: number,
  y: number,
  s: string,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg
) {
  [fg, bg] = colors.getColors(fg, bg);
  return rotDisplay.drawText(x, y, `%c{${fg}}%b{${bg}}${s}%c{}%b{}`);
}

export function getContainer() {
  if (!rotDisplay) init();
  return rotDisplay.getContainer();
}
