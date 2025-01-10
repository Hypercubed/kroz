import { default as Display } from 'rot-js/lib/display/display';
import { HEIGHT, WIDTH } from '../data/constants';
import { Color, ColorCodes } from '../data/colors';

let rotDisplay: Display;

export function init() {
  Display.Rect.cache = true;

  rotDisplay = new Display({
    width: WIDTH,
    height: HEIGHT,
    fontFamily: 'IBM_VGA, monospace',
    bg: ColorCodes[Color.Black], // background
    fg: ColorCodes[Color.White], // foreground
    fontSize: 64, // canvas fontsize,
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
}

export function writeCenter(
  y: number,
  s: string,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg,
) {
  const x = Math.floor((WIDTH - s.length) / 2);
  drawText(x, y, s, fg, bg);
}

export function clear(bg: string | Color = rotDisplay.getOptions().bg) {
  if (typeof bg === 'number') bg = ColorCodes[bg];
  rotDisplay.setOptions({ bg });
  rotDisplay.clear();
}

export function getColors(
  fg: string | Color,
  bg: string | Color = rotDisplay.getOptions().bg,
) {
  // Blinking
  if (typeof fg === 'number' && fg > 15) {
    const v = 500;
    const f = Date.now() % v < v / 2;
    fg = f ? fg % 16 : bg;
  }

  if (typeof fg === 'number') fg = ColorCodes[fg];
  if (typeof bg === 'number') bg = ColorCodes[bg];

  return [fg, bg];
}

export function draw(
  x: number,
  y: number,
  ch: string | null,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg,
) {
  [fg, bg] = getColors(fg, bg);
  rotDisplay.draw(x, y, ch, fg, bg);
}

export function drawOver(
  x: number,
  y: number,
  ch: string | null,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg,
) {
  [fg, bg] = getColors(fg, bg);
  rotDisplay.drawOver(x, y, ch, fg, bg);
}

export function drawText(
  x: number,
  y: number,
  s: string,
  fg: string | Color = rotDisplay.getOptions().fg,
  bg: string | Color = rotDisplay.getOptions().bg,
) {
  if (typeof fg === 'number' && fg > 15) {
    const v = 500;
    const f = Date.now() % v < v / 2;
    fg = f ? fg : bg;
  }

  if (typeof bg === 'number') bg = ColorCodes[(bg % 16) as Color];
  if (typeof fg === 'number') fg = ColorCodes[(fg % 16) as Color];
  return rotDisplay.drawText(x, y, `%c{${fg}}%b{${bg}}` + s);
}

export function getContainer() {
  if (!rotDisplay) init();
  return rotDisplay.getContainer();
}
