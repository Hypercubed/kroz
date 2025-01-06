import * as sound from './modules/sound';
import * as state from './modules/state';

import { TileChar, Tile } from './tiles';
import { FLOOR_CHAR, TIME_SCALE } from './constants';
import { Timer } from './modules/state';

export type EntityType = Tile.Player | Tile.Slow | Tile.Medium | Tile.Fast;

function getBaseSpeed(t: EntityType) {
  switch (t) {
    case Tile.Player:
      return TIME_SCALE;
    case Tile.Slow:
      return TIME_SCALE / 4;
    case Tile.Medium:
      return TIME_SCALE / 3;
    case Tile.Fast:
      return TIME_SCALE / 2;
  }
}

export class Entity {
  ch: string;
  speed: number;

  constructor(
    public readonly type: EntityType,
    public x: number,
    public y: number,
  ) {
    this.x = x;
    this.y = y;

    this.ch = TileChar[this.type];
    this.speed = getBaseSpeed(this.type);
  }

  move(x: number, y: number) {
    if (this.type === Tile.Player) {
      sound.footStep();
    } else if (this.type === Tile.Slow) {
      this.ch = Math.random() > 0.5 ? 'A' : 'Ä';
    } else if (this.type === Tile.Medium) {
      this.ch = Math.random() > 0.5 ? 'ö' : 'Ö';
    }

    this.x = x;
    this.y = y;
  }

  async kill() {
    await sound.play(200 + 200 * this.type, 25, 100);

    this.x = -1;
    this.y = -1;
  }

  getChar() {
    if (this.type === Tile.Player)
      return state.state.T[Timer.Invisible] > 0
        ? FLOOR_CHAR
        : TileChar[this.type];
    return this.ch;
  }

  getSpeed() {
    if (this.type === Tile.Player)
      return state.state.T[Timer.SlowTime] > 0 ? 10 : 1;
    return state.state.T[Timer.SpeedTime] > 0 ? TIME_SCALE : this.speed;
  }
}
