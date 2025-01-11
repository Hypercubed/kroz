import * as sound from '../modules/sound';
import * as state from '../modules/state';

import { TypeChar, Type } from '../data/tiles';
import { FLOOR_CHAR, TIME_SCALE } from '../data/constants';
import { Timer } from '../modules/state';
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

  private replacement = Type.Floor;

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

  move(x: number, y: number) {
    if (this.type === Type.Player) {
      sound.footStep();
    } else if (this.type === Type.Slow) {
      this.ch = Math.random() > 0.5 ? 'A' : 'Ä';
    } else if (this.type === Type.Medium) {
      this.ch = Math.random() > 0.5 ? 'ö' : 'Ö';
    }

    this.gotoYX(x, y);
  }

  gotoYX(x: number, y: number) {
    const px = this.x;
    const py = this.y;

    state.level.map.setType(px, py, this.replacement);

    if (this.type === Type.Player) {
      const b = state.level.map.getType(x, y) as Type;
      this.replacement = [
        Type.CWall1,
        Type.CWall2,
        Type.CWall3,
        Type.Rope,
      ].includes(b)
        ? b
        : Type.Floor;
    }

    state.level.map.set(x, y, this);

    this.x = x;
    this.y = y;
  }

  async kill() {
    if (this.type < 3) {
      await sound.play(200 + 200 * this.type, 25, 100);
    }
    this.gotoYX(-1, -1);
  }

  getChar() {
    if (this.type === Type.Player)
      return state.level.T[Timer.Invisible] > 0
        ? FLOOR_CHAR
        : TypeChar[this.type];
    return this.ch;
  }

  getSpeed() {
    if (this.type === Type.Player)
      return state.level.T[Timer.SlowTime] > 0 ? 10 : 1;
    return state.level.T[Timer.SpeedTime] > 0 ? TIME_SCALE : this.speed;
  }
}
