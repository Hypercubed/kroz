import { RNG } from 'rot-js';
import { XSize, YSize } from '../data/constants';
import { Tile } from '../data/tiles';

export class PlayField {
  private PF = [] as (Tile | string)[][];

  constructor(
    public width = XSize + 1,
    public height = YSize + 1,
  ) {}

  get(x: number, y: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return Tile.Border;
    }
    return this.PF?.[x]?.[y] ?? Tile.Floor;
  }

  set(x: number, y: number, tile: Tile | string) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.PF[x] ??= [];
    this.PF[x][y] = tile;
  }

  findRandomEmptySpace(): [number, number] {
    while (true) {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = this.get(x, y);
      if (block === Tile.Floor) {
        return [x, y];
      }
    }
  }
}
