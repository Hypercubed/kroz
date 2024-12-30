import { TileChar, Tile } from './tiles';
import { FLOOR_CHAR } from './constants';
import * as sound from './sound';
import * as world from './world';
import { Timer } from './world';

export type EntityType = Tile.Player | Tile.Slow | Tile.Medium | Tile.Fast;

export class Entity {
  ch: string;

  constructor(
    public readonly type: EntityType,
    public x: number,
    public y: number,
  ) {
    this.x = x;
    this.y = y;

    this.ch = TileChar[type];
  }

  move(x: number, y: number) {
    if (this.type === Tile.Player) {
      sound.footStep();
    }
    else if (this.type === Tile.Slow) {
      this.ch = Math.random() > 0.5 ? 'A' : 'Ä';
    } else if (this.type === Tile.Medium) {
      this.ch = Math.random() > 0.5 ? 'ö' : 'Ö';
    }

    this.x = x;
    this.y = y;
  }

  kill() {
    sound.play(200 + 200 * this.type, 25, 100);

    this.x = -1;
    this.y = -1;
  }

  getChar() {
    // TODO: remove dependencey on world.state
    if (this.type === Tile.Player) return world.state.T[Timer.Invisible] > 0 ? FLOOR_CHAR : TileChar[this.type];
    return this.ch;
  }

  getSpeed() {
    // TODO: remove dependencey on world.state
    switch (this.type) {
      case Tile.Player: return 30;
      case Tile.Slow: return 10 * world.getTimeScale();
      case Tile.Medium: return 20 * world.getTimeScale();
      case Tile.Fast: return 30 * world.getTimeScale();
    }
  }
}
