import { default as RNG } from 'rot-js/lib/rng';

import { XMax, YMax } from '../constants/constants';
import { Entity } from './entity';
import { Type } from '../constants/types';

export class PlayField {
  private PF: Entity[] = [];

  constructor(
    public width = XMax + 1,
    public height = YMax + 1
  ) {}

  protected getIndex(x: number, y: number): number {
    return y * this.width + x;
  }

  get(x: number, y: number): Entity | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    const index = this.getIndex(x, y);
    return this.PF[index];
  }

  set(x: number, y: number, entity: Entity): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    const index = this.getIndex(x, y);
    this.PF[index] = entity;
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

  fill(callback: (x: number, y: number, i: number) => Entity) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, callback(x, y, this.getIndex(x, y)));
      }
    }
  }
}
