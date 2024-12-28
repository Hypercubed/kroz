import { Tile } from "./blocks";

export type EntityType = Tile.Player | Tile.Slow | Tile.Medium | Tile.Fast;

export class Entity {
  constructor(
    public readonly type: EntityType,
    public x: number,
    public y: number,
  ) {
    this.x = x;
    this.y = y;
  }

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  kill() {
    this.x = -1;
    this.y = -1;
  }
}
