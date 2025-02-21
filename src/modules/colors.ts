import { BLINK } from '../constants/constants';
import * as world from './world';

// PASCAL color codes
export enum Color {
  Black = 0,
  Blue = 1,
  Green = 2,
  Cyan = 3,
  Red = 4,
  Magenta = 5,
  Brown = 6,
  White = 7,
  Grey = 8,
  LightBlue = 9,
  LightGreen = 10,
  LightCyan = 11,
  LightRed = 12,
  LightMagenta = 13,
  Yellow = 14,
  HighIntensityWhite = 15
}

// PASCAL colors
export const ColorCodes = {
  [Color.Black]: '#000000',
  [Color.Blue]: '#0000AA',
  [Color.Green]: '#00AA00',
  [Color.Cyan]: '#00AAAA',
  [Color.Red]: '#AA0000',
  [Color.Magenta]: '#AA00AA',
  [Color.Brown]: '#AA5500',
  [Color.White]: '#AAAAAA',
  [Color.Grey]: '#AAAAAA',
  [Color.LightBlue]: '#5555FF',
  [Color.LightGreen]: '#55FF55',
  [Color.LightCyan]: '#55FFFF',
  [Color.LightRed]: '#FF5555',
  [Color.LightMagenta]: '#FF55FF',
  [Color.Yellow]: '#FFFF55',
  [Color.HighIntensityWhite]: '#FFFFFF'
};

export async function setColors(colors: Record<string, string>) {
  for (const k in colors) {
    const code = Color[k as keyof typeof Color];
    if (!k) continue;
    ColorCodes[code] = colors[k];
  }
}

export function getColor(c: string | Color, alpha: number = 1): string {
  if (typeof c === 'number') {
    if (c > 15) {
      // Add blink
      c %= 16;
      if (BLINK && !world.game.paused && world.game.started) {
        const v = 500;
        const f = Date.now() % v < v / 2;
        if (!f) alpha = 0;
      }
    }
    c = ColorCodes[c];
  }

  if (alpha < 1) {
    c =
      c +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0');
  }
  return c;
}

type Tuple<T, N, R extends T[] = []> = R['length'] extends N
  ? R
  : Tuple<T, N, [...R, T]>;

export function getColors<N extends number = 2>(
  ...args: Tuple<string | Color, N>
): Tuple<string, N> {
  return (args as Array<string | Color>).map((c) => getColor(c)) as Tuple<
    string,
    N
  >;
}
