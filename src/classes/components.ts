import { RNG } from 'rot-js';

import { Type } from '../modules/tiles';
import * as tiles from '../modules/tiles';

/** # Tags */

/**  ## isMob
 *
 * Entity is Mobile */
export const isMob = Symbol('isMob');

/**  ## followsPlayer
 *
 * Entity will follow the player, must be used with isMob */
export const followsPlayer = Symbol('followsPlayer');

/**  ## isPlayer */
export const isPlayer = Symbol('isPlayer');

/**  ## isGenerator */
export const isGenerator = Symbol('isGenerator');

/**  ## isInvisible */
export const isInvisible = Symbol('isInvisible');

/**  ## isSecreted
 *
 * Entity is hidden from the player, will appear as a Chance (?)
 */
export const isSecreted = Symbol('isSecreted');

/**  ## isPushable */
export const isPushable = Symbol('isPushable');

/**  ## isPassable
 * Tile is able to be walked on by the player
 */
export const isPassable = Symbol('isPassable');

export const isImpervious = Symbol('isImpervious');

/**
 * ## isBombable
 *
 * Tile is destructible by bombs
 */
export const isBombable = Symbol('isBombable');

/** # Components */

/**  ## Renderable
 *
 * A renderable is a component that can be rendered to the screen.  It contains values for the character, color, and background color. */
export class Renderable {
  ch: string;
  fg: number | null;
  bg: number | null;
  blink: boolean = false;

  constructor(data: Partial<Renderable>) {
    this.ch = data.ch ?? tiles.common.FLOOR_CHAR;
    this.fg = data.fg ?? tiles.common.FLOOR_FG;
    this.bg = data.bg ?? tiles.common.FLOOR_BG;
    this.blink = data.blink ?? false;
  }
}

/**  ## Position
 *
 * A position is a component that contains the x and y coordinates of an entity.  It is used to place mobile entities on the screen. */
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
 * ##  Walkable
 *
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

/**
 * ##  Eats
 *
 * Component to store the type of entity that can be eaten by this entity.
 */
export class Eats {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

/**
 * ##  DestroyedBy
 *
 * Component to store the type of entity that can be destroyed by this entity.
 */
export class DestroyedBy {
  set: Set<Type | string>;

  constructor(data: Array<Type | string>) {
    this.set = new Set(data);
  }

  has(type: Type | string) {
    return this.set.has(type);
  }
}

/**
 * ##  Attacks
 *
 * A component that allows an entity to attack the player.  It contains a damage value.
 */
export class Attacks {
  damage: number;

  constructor(data: Partial<Attacks>) {
    this.damage = data.damage || 1;
  }
}

/**
 * ##  Collectible
 *
 * A component that allows an entity to be collected by the player.  It contains a count for each item to be collected.
 * */
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

/**
 * ##  AnimatedWalking
 *
 * A component that allows an entity to animate while walking.  It contains a list of character values to be displayed randomly.
 */
export class AnimatedWalking {
  constructor(public frames: string) {}

  getFrame() {
    return this.frames[RNG.getUniformInt(0, this.frames.length - 1)];
  }
}

export class Glitch {
  i = 0;
  ch = '';

  constructor(public frames: string) {
    this.ch = frames[0];
  }

  getFrame() {
    this.i++;
    if (this.i % 20 === 0) {
      this.ch = this.frames[RNG.getUniformInt(0, this.frames.length - 1)];
    }
    return this.ch;
  }
}

/**
 * ##  Trigger
 *
 * A component that allows an entity to trigger an event when it is interacted with.
 */
export class Trigger {
  constructor(public message: string) {}
}

/**
 * ##  ChangeLevel
 */
export class ChangeLevel {
  exactLevel: number | null = null;
  deltaLevel: number = 0;

  constructor(data: Partial<ChangeLevel>) {
    this.exactLevel = data.exactLevel ?? null;
    this.deltaLevel = data.deltaLevel ?? 0;
  }
}

/**
 * ##  Speed
 *
 * A component that allows an entity to move at different speeds.  It contains a base pace and a hasted pace.
 */
export class Speed {
  basePace!: number;
  hastedPace!: number;

  constructor(data: Partial<Speed>) {
    this.basePace = data.basePace || 1;
    this.hastedPace = data.hastedPace || 1;
  }
}

/**
 * ##  Breakable
 *
 * A component that allows an entity to be broken when whipped.
 * I contains a hardness value and a sound to play when hit.
 */
export class Breakable {
  hardness: number = 0;
  hitSound: string | null = null;

  constructor(data: Partial<Breakable>) {
    this.hardness = data.hardness || 0;
    this.hitSound = data.hitSound || null;
  }
}

/**
 * ##  FoundMessage
 *
 * A component that displays a message when the entity is first found.
 */
export class FoundMessage {
  constructor(public message: string) {}
}
