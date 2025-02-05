import { default as RNG } from 'rot-js/lib/rng';

import * as tiles from '../modules/tiles';

import { XMax, YMax } from '../data/constants';
import { Type } from '../modules/tiles';
import { Entity } from './entity';

export class PlayField {
  private PF = [] as Entity[][];

  constructor(
    public width = XMax + 1,
    public height = YMax + 1
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

  // Only works for base types, those defined in the tileset
  setType(x: number, y: number, type: Type) {
    this.set(x, y, tiles.createEntityOfType(type, x, y));
  }

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

  async forEach(
    callback: (x: number, y: number, e: Entity) => Promise<void> | void
  ) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (!e) continue;
        await callback(x, y, e);
      }
    }
  }

  // Rename.... this is not a map
  async map(
    callback: (x: number, y: number, e: Entity) => Promise<Entity> | Entity
  ) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (!e) continue;
        this.set(x, y, await callback(x, y, e));
      }
    }
  }
}
