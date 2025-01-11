import { RNG } from 'rot-js';
import { XSize, YSize } from '../data/constants';
import { Type, TypeChar, TypeColor } from '../data/tiles';
import { Entity } from './entity';

export class PlayField {
  private PF = [] as Entity[][];

  constructor(
    public width = XSize,
    public height = YSize,
  ) {}

  get(x: number, y: number): Entity | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.PF?.[x]?.[y];
  }

  set(x: number, y: number, entity: Entity): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }

    this.PF[x] ??= [];
    this.PF[x][y] = entity;
  }

  getType(x: number, y: number): Type | string {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return Type.Border;
    }
    const type = this.get(x, y)?.type;
    if (typeof type === 'string') {
      return type;
    }
    return type ?? Type.Floor;
  }

  setType(x: number, y: number, tile: Type | string) {
    const entity = new Entity(tile);
    this.set(x, y, entity);
  }

  findRandomEmptySpace(): [number, number] {
    while (true) {
      const x = RNG.getUniformInt(0, XSize);
      const y = RNG.getUniformInt(0, YSize);
      const block = this.getType(x, y);
      if (block === Type.Floor) {
        return [x, y];
      }
    }
  }

  replaceEntities(type: Type | string, entity: Entity) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.getType(x, y) === type) {
          this.set(x, y, entity);
        }
      }
    }
  }

  hideType(type: Type) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e?.type === type) {
          e.ch = TypeChar[Type.Floor];
          e.fg = TypeColor[Type.Floor][0]!;
          e.bg = TypeColor[Type.Floor][1]!;
        }
      }
    }
  }
}
