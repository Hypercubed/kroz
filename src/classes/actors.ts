import * as sound from '../modules/sound';
import * as world from '../modules/world';

import { TypeChar, Type } from '../data/tiles';
import { FLOOR_CHAR, TIME_SCALE } from '../data/constants';
import { Timer } from '../modules/world';
import { SpeedActor } from 'rot-js';
import { Entity } from './entity';

export type ActorType =
  | Type.Player
  | Type.Slow
  | Type.Medium
  | Type.Fast
  | Type.MBlock;

function getBaseSpeed(t: ActorType) {
  switch (t) {
    case Type.Player:
      return TIME_SCALE;
    case Type.Slow:
      return TIME_SCALE / 4;
    case Type.Medium:
      return TIME_SCALE / 3;
    case Type.Fast:
      return TIME_SCALE / 2;
    case Type.MBlock:
      return TIME_SCALE / 2;
  }
}

export class Actor extends Entity implements SpeedActor {
  speed: number;
  replacement = Type.Floor;

  constructor(
    public readonly type: ActorType,
    public x: number,
    public y: number,
  ) {
    super(type);
    this.x = x;
    this.y = y;

    this.speed = getBaseSpeed(this.type);
  }

  async kill() {
    if (this.type < 3) {
      await sound.play(200 + 200 * this.type, 25, 100);
    }
    this.x = -1;
    this.y = -1;
  }

  getChar() {
    if (this.type === Type.Player)
      return world.level.T[Timer.Invisible] > 0
        ? FLOOR_CHAR
        : TypeChar[this.type];
    return this.ch;
  }

  getSpeed() {
    if (this.type === Type.Player)
      return world.level.T[Timer.SlowTime] > 0 ? 10 : 1;
    return world.level.T[Timer.SpeedTime] > 0 ? TIME_SCALE : this.speed;
  }
}
