import { Color } from '../data/colors';
import { FLOOR_CHAR } from '../data/constants';
import { Type, TypeChar, TypeColor } from '../data/tiles';

export type EntityData = {
  type: Type | string;
  x: number;
  y: number;
  ch: string;
  fg: number | null;
  bg: number | null;
};

export class Entity {
  replacement = Type.Floor;

  ch: string = FLOOR_CHAR;
  fg: number | null = TypeColor[Type.Floor][0]!;
  bg: number | null = TypeColor[Type.Floor][1]!;
  x = 0;
  y = 0;

  constructor(
    public readonly type: Type | string,
    data: Partial<EntityData> = {},
  ) {
    const { x, y } = data;
    let { ch, fg, bg } = data;

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

    this.ch = ch ?? FLOOR_CHAR;
    this.fg = fg;
    this.bg = bg;
    this.x = x ?? 0;
    this.y = y ?? 0;
  }
}
