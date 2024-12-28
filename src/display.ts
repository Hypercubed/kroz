import { Display as _Display } from "rot-js";
import { HEIGHT, WIDTH } from "./constants";

_Display.Rect.cache = true;

export enum Colors {
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
  HighIntensityWhite = 15,
}

export const ColorCodes = {
  [Colors.Black]: "black",
  [Colors.Blue]: "blue",
  [Colors.Green]: "green",
  [Colors.Cyan]: "cyan",
  [Colors.Red]: "red",
  [Colors.Magenta]: "magenta",
  [Colors.Brown]: "brown",
  [Colors.White]: "#D3D3D3",
  [Colors.Grey]: "#808080",
  [Colors.LightBlue]: "#ADD8E6",
  [Colors.LightGreen]: "#90EE90",
  [Colors.LightCyan]: "#E0FFFF",
  [Colors.LightRed]: "#FF474C",
  [Colors.LightMagenta]: "#FFC0CB",
  [Colors.Yellow]: "yellow",
  [Colors.HighIntensityWhite]: "white",
};

export class Display {
  rotDisplay = new _Display({
    width: WIDTH,
    height: HEIGHT,
    fontFamily: "ModernDOS9x16, monospace",
    bg: "blue", // background
    fg: "white", // foreground
    fontSize: 32, // canvas fontsize
    // forceSquareRatio: true, // make the canvas squared ratio
    // spacing: 0.50
  });

  x = 0;
  y = 0;
  bg = "black";
  fg = "white";

  constructor() {}

  print(x: number, y: number, s: string) {
    this.gotoxy(x, y);
    this.writeln(s);
  }

  gotoxy(x: number, y: number = this.y) {
    this.x = x;
    this.y = y;
  }

  writeln(s: string) {
    this.write(s);
    this.y++;
  }

  write(s: string) {
    this.rotDisplay.drawText(
      this.x,
      this.y,
      `%c{${this.fg}}%b{${this.bg}}` + s,
    );
  }

  bak(bg: Colors | string) {
    if (typeof bg === "number") bg = ColorCodes[bg];
    this.bg = bg;
  }

  col(fg: Colors | string) {
    if (typeof fg === "number") fg = ColorCodes[fg];
    this.fg = fg;
  }

  clear() {
    this.rotDisplay.clear();
  }

  draw(
    x: number,
    y: number,
    ch: string | string[] | null,
    fg: string = this.fg,
    bg: string = this.bg,
  ) {
    if (typeof fg === "number") fg = ColorCodes[fg];
    if (typeof bg === "number") bg = ColorCodes[bg];
    this.rotDisplay.draw(x, y, ch, fg, bg);
  }

  drawOver(
    x: number,
    y: number,
    ch: string | null,
    fg: string = this.fg,
    bg: string = this.bg,
  ) {
    if (typeof fg === "number") fg = ColorCodes[fg];
    if (typeof bg === "number") bg = ColorCodes[bg];
    this.rotDisplay.drawOver(x, y, ch, fg, bg);
  }

  drawText(
    x: number,
    y: number,
    s: string,
    fg: string = this.fg,
    bg: string = this.bg,
  ) {
    if (typeof fg === "number") fg = ColorCodes[fg];
    if (typeof bg === "number") bg = ColorCodes[bg];
    this.rotDisplay.drawText(x, y, `%c{${fg}}%b{${bg}}` + s);
  }

  getContainer() {
    return this.rotDisplay.getContainer();
  }
}
