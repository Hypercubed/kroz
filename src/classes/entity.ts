import { Color } from '../data/colors';
import { Type, TypeChar, TypeColor } from '../data/tiles';

export class Entity {
  ch: string;
  fg: number | null;
  bg: number | null;

  constructor(
    public readonly type: Type | string,
    ch?: string,
    fg?: number | null,
    bg?: number | null,
  ) {
    if (fg === null) fg = TypeColor[Type.Floor][0]!;
    if (bg === null) bg = TypeColor[Type.Floor][1]!;

    if (typeof type === 'string') {
      ch ??= type.toLocaleUpperCase();
      fg ??= Color.HighIntensityWhite;
      bg ??= Color.Brown;
    } else {
      ch ??= TypeChar[type];
      fg ??= TypeColor[type][0] ?? TypeColor[Type.Floor][0]!;
      bg ??= TypeColor[type][1] ?? TypeColor[Type.Floor][1]!;
    }

    this.ch = ch;
    this.fg = fg;
    this.bg = bg;
  }

  getChar() {
    return this.ch;
  }
}
