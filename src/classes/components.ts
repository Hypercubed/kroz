import { FLOOR_CHAR } from '../data/constants';
import { Type, TypeColor } from '../data/tiles';

export const FollowsPlayer = Symbol('FollowsPlayer');
export const isPlayer = Symbol('isPlayer');
export const isMobile = Symbol('isMobile');
export const isGenerator = Symbol('isGenerator');

export class Renderable {
  ch: string;
  fg: number | null;
  bg: number | null;

  constructor(
    data: Partial<{ ch: string; fg: number | null; bg: number | null }>,
  ) {
    this.ch = data.ch ?? FLOOR_CHAR;
    this.fg = data.fg ?? TypeColor[Type.Floor][0]!;
    this.bg = data.bg ?? TypeColor[Type.Floor][1]!;
  }
}

export class Position {
  replacement = Type.Floor;

  x!: number;
  y!: number;

  constructor(data: Partial<{ x: number; y: number }> = {}) {
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
  }

  moveTo(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  die() {
    this.x = -1;
    this.y = -1;
  }

  isDead() {
    return this.x === -1 || this.y === -1;
  }
}

export class Walkable {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

export class Eats {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

export class KilledBy {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

export class Attacks {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

export class ChanceProbability {
  constructor(public probability: number) {}
}
