import { Display } from 'rot-js';
import { HEIGHT, WIDTH } from './constants';
import { TileColor, Tile } from './tiles';
import { Color, ColorCodes } from './colors';

Display.Rect.cache = true;

const rotDisplay = new Display({
  width: WIDTH,
  height: HEIGHT,
  fontFamily: 'IBM_VGA, monospace',
  bg: ColorCodes[Color.Blue], // background
  fg: ColorCodes[Color.White], // foreground
  fontSize: 64, // canvas fontsize,
});

const state = {
  x: 0,
  y: 0,
  bg: 'black',
  fg: 'white',
};

export function gotoxy(x: number, y: number = state.y) {
  state.x = x;
  state.y = y;
}

export function bak(bg: Color | string) {
  if (typeof bg === 'number') bg = ColorCodes[bg];
  state.bg = bg;
}

export function col(fg: Color | string) {
  if (typeof fg === 'number') fg = ColorCodes[fg];
  state.fg = fg;
}

export function writeln(
  s: string,
  fg: string | Color = state.fg,
  bg: string | Color = state.bg,
) {
  state.y += drawText(state.x, state.y, s, fg, bg);
}

export function writeCenter(
  s: string,
  fg: string | Color = state.fg,
  bg: string | Color = state.bg,
) {
  const x = Math.floor((WIDTH - s.length) / 2);
  state.y += drawText(x, state.y, s, fg, bg);
}

export function print(x: number, y: number, s: string) {
  gotoxy(x, y);
  writeln(s);
}

export function clear(bg: string | Color = state.bg) {
  if (typeof bg === 'number') bg = ColorCodes[bg];
  rotDisplay.setOptions({ bg });
  state.bg = bg;
  rotDisplay.clear();
}

function getColors(fg: string | Color, bg: string | Color) {
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
  ch: string | string[] | null,
  fg: string | Color = state.fg,
  bg: string | Color = state.bg,
) {
  [fg, bg] = getColors(fg, bg);
  rotDisplay.draw(x, y, ch, fg, bg);
}

export function drawOver(
  x: number,
  y: number,
  ch: string | null,
  fg: string | Color = state.fg,
  bg: string | Color = state.bg,
) {
  [fg, bg] = getColors(fg, bg);
  bg = bg ?? rotDisplay._data[`${x},${y}`]?.[4] ?? TileColor[Tile.Floor];
  rotDisplay.draw(x, y, ch, fg, bg);
}

export function drawText(
  x: number,
  y: number,
  s: string,
  fg: string | Color = state.fg,
  bg: string | Color = state.bg,
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
  return rotDisplay.getContainer();
}
