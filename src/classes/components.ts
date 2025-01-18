import { RNG } from 'rot-js';
import { FLOOR_CHAR } from '../data/constants';
import { Type, TypeColor } from '../data/tiles';

export const FollowsPlayer = Symbol('FollowsPlayer');
export const isPlayer = Symbol('isPlayer');
export const isMobile = Symbol('isMobile');
export const isGenerator = Symbol('isGenerator');
export const isInvisible = Symbol('isInvisible');

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

/**
 * Component to store the type of entity that can walk on this tile.
 */
export class Walkable {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  by(type: Type | string) {
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

export class DestroyedBy {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

export class AttacksPlayer {
  damage: number;

  constructor(data: Partial<AttacksPlayer>) {
    this.damage = data.damage || 1;
  }
}

export class ChanceProbability {
  constructor(public probability: number) {}
}

export class Collectible {
  keys: number = 0;
  gems: number = 0;
  whips: number = 0;
  teleports: number = 0;
  whipPower: number = 0;

  constructor(data?: Partial<Collectible>) {
    this.keys = data?.keys || 0;
    this.gems = data?.gems || 0;
    this.whips = data?.whips || 0;
    this.whipPower = data?.whipPower || 0;
    this.teleports = data?.teleports || 0;
  }
}

export class AnimatedWalking {
  constructor(public frames: string) {}

  getFrame() {
    return this.frames[RNG.getUniformInt(0, this.frames.length - 1)];
  }
}

export class MagicTrigger {
  constructor(public type: Type) {}
}