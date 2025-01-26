import { RNG } from 'rot-js';

import { FLOOR_CHAR } from '../data/constants';
import { Type, TypeColor } from '../data/tiles';

export const followsPlayer = Symbol('followsPlayer');
export const isPlayer = Symbol('isPlayer');
export const isMobile = Symbol('isMobile');
export const isGenerator = Symbol('isGenerator');
export const isInvisible = Symbol('isInvisible');
export const isSecreted = Symbol('isSecreted'); // Appears as ?
export const isPushable = Symbol('isPushable');
export const isPassable = Symbol('isPushable');

export class Renderable {
  ch: string;
  fg: number | null;
  bg: number | null;
  blink: boolean = false;

  constructor(data: Partial<Renderable>) {
    this.ch = data.ch ?? FLOOR_CHAR;
    this.fg = data.fg ?? TypeColor[Type.Floor][0]!;
    this.bg = data.bg ?? TypeColor[Type.Floor][1]!;
    this.blink = data.blink ?? false;
  }
}

export class Position {
  replacement = Type.Floor;

  x!: number;
  y!: number;
  px: number | null = null;
  py: number | null = null;

  constructor(data: Partial<{ x: number; y: number }> = {}) {
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
  }

  moveTo(x: number, y: number) {
    this.px = this.x;
    this.py = this.y;
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

export class Collectible {
  keys: number = 0;
  gems: number = 0;
  whips: number = 0;
  teleports: number = 0;
  whipPower: number = 0;
  // TODO: Add points

  constructor(data?: Partial<Collectible>) {
    this.keys = data?.keys || 0;
    this.gems = data?.gems || 0;
    this.whips = data?.whips || 0;
    this.whipPower = data?.whipPower || 0;
    this.teleports = data?.teleports || 0;
  }
}

// TODO: Replace with using Renderable
export class AnimatedWalking {
  constructor(public frames: string) {}

  getFrame() {
    return this.frames[RNG.getUniformInt(0, this.frames.length - 1)];
  }
}

export class MagicTrigger {
  constructor(public type: Type) {}
}

export class ReadMessage {
  constructor(public message: string) {}
}

export class ChangeLevel {
  exactLevel: number | null = null;
  deltaLevel: number = 0;

  constructor(data: Partial<ChangeLevel>) {
    this.exactLevel = data.exactLevel ?? null;
    this.deltaLevel = data.deltaLevel ?? 0;
  }
}

export class Speed {
  basePace!: number;
  hastedPace!: number;

  constructor(data: Partial<Speed>) {
    this.basePace = data.basePace || 1;
    this.hastedPace = data.hastedPace || 1;
  }
}
