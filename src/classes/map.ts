import { default as RNG } from 'rot-js/lib/rng';
import { XMax, YMax } from '../data/constants';
import { createTileEntity, Type } from '../data/tiles';
import { Entity } from './entity';
import { isInvisible, Renderable } from './components';

export class PlayField {
  private PF = [] as Entity[][];

  constructor(
    public width = XMax + 1,
    public height = YMax + 1,
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

  // TODO: get rid of this, doesn't work for mobs
  setType(x: number, y: number, type: Type | string) {
    this.set(x, y, createTileEntity(type));
  }

  // TODO: move some of these outside of the class to eliminate dependencies

  findRandomEmptySpace(): [number, number] {
    while (true) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = this.getType(x, y);
      if (block === Type.Floor) {
        return [x, y];
      }
    }
  }

  updateTilesByType(type: Type | string, tileData: Partial<Renderable>) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e?.type === type) {
          const t = e.get(Renderable)!;
          Object.assign(t, tileData);
        }
      }
    }
  }

  hideType(type: Type) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e?.type === type) {
          e.add(isInvisible);
        }
      }
    }
  }
}
