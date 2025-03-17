import { default as RNG } from 'rot-js/lib/rng';

import { XMax, YMax } from '../constants/constants';
import { Entity } from './entity';
import { Type } from '../constants/types';
import { StridedView } from 'strided-view';

export class PlayField extends StridedView<Entity> {
  constructor(width = XMax + 1, height = YMax + 1) {
    super([], [width, height]);
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

  findRandomEmptySpace(): [number, number] | null {
    let n = 0;
    while (n < XMax * YMax * 10) {
      const x = RNG.getUniformInt(0, XMax);
      const y = RNG.getUniformInt(0, YMax);
      const block = this.getType(x, y);
      if (block === Type.Floor) {
        return [x, y];
      }
      n++;
    }
    return null;
  }

  // TODO: Get rid of this method
  fromArray(arr: Entity[]): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.data.splice(0, this.data.length, ...arr);
  }
}
