import { DIRS, RNG } from 'rot-js';

type FillCallback<T> = (x: number, y: number, m: Matrix<T>) => T;
type ForEachCallback<T> = (e: T, x: number, y: number, m: Matrix<T>) => void;
type ForEachAsyncCallback<T> = (e: T, x: number, y: number) => Promise<void>;
type MapCallback<T, R> = (e: T | null, x: number, y: number, m: Matrix<T>) => R;
type ReduceCallback<T, R> = (acc: R, e: T, x: number, y: number) => R;
type FilterCallback<T> = (e: T) => boolean;

export class Matrix<T> {
  static fromArrays<T>(arrays: T[][]): Matrix<T> {
    const height = arrays.length;
    const width = arrays[0].length;
    const matrix = new Matrix<T>(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        matrix.set(x, y, arrays[y][x]);
      }
    }
    return matrix;
  }

  static fromArraysTransposed<T>(arrays: T[][]): Matrix<T> {
    const width = arrays.length;
    const height = arrays[0].length;
    const matrix = new Matrix<T>(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        matrix.set(x, y, arrays[x][y]);
      }
    }
    return matrix;
  }

  private data: Array<T> = [];

  constructor(
    public width: number,
    public height: number
  ) {}

  protected getIndex(x: number, y: number): number {
    return y * this.width + x;
  }

  get(x: number, y: number): T | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.data[y * this.width + x];
  }

  set(x: number, y: number, item: T): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.data[y * this.width + x] = item;
  }

  fill(value: T | FillCallback<T>): void {
    let cb: FillCallback<T> | null = null;
    if (typeof value === 'function') cb = value as FillCallback<T>;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, (cb ? cb(x, y, this) : value) as T);
      }
    }
  }

  fillRegion(
    value: T | FillCallback<T>,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): void {
    let cb: FillCallback<T> | null = null;
    if (typeof value === 'function') cb = value as FillCallback<T>;

    for (let y = y0; y < y1 + 1; y++) {
      for (let x = x0; x < x1 + 1; x++) {
        this.set(x, y, (cb ? cb(x, y, this) : value) as T);
      }
    }
  }

  place<R>(
    subMap: Matrix<R>,
    x0: number,
    y0: number,
    callbackFn: MapCallback<R, T | null>
  ): void;
  place(subMap: Matrix<T>, x0: number, y0: number): void;
  place<R>(
    subMap: Matrix<R>,
    x0: number,
    y0: number,
    callbackFn?: MapCallback<R, T | null>
  ): void {
    for (let x = 0; x < subMap.width; x++) {
      for (let y = 0; y < subMap.height; y++) {
        const e = subMap.get(x, y);
        const [xx, yy] = [x + x0, y + y0];
        const p = callbackFn ? callbackFn(e, xx, yy, subMap) : (e as T);
        if (p === null) continue;
        this.set(xx, yy, p);
      }
    }
  }

  map<R>(callbackFn: MapCallback<T, R>) {
    const matrix = new Matrix<R>(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = this.get(x, y);
        matrix.set(x, y, callbackFn(e, x, y, this));
      }
    }
    return matrix;
  }

  forEach(callbackFn: ForEachCallback<T>) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e === null) continue;
        callbackFn(e, x, y, this);
      }
    }
  }

  reduce<R>(callbackFn: ReduceCallback<T, R>, initialValue: R): R {
    let acc = initialValue;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e === null) continue;
        acc = callbackFn(acc, e, x, y);
      }
    }
    return acc;
  }

  some(predicate: FilterCallback<T> | T): boolean {
    const callbackFn: FilterCallback<T> | null =
      typeof predicate === 'function' ? (predicate as FilterCallback<T>) : null;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e === null) continue;
        const flag = callbackFn ? callbackFn(e) : e === predicate;
        if (flag) return true;
      }
    }
    return false;
  }

  async forEachAsync(callbackFn: ForEachAsyncCallback<T>) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (e === null) continue;
        await callbackFn(e, x, y);
      }
    }
  }

  getRandom(predicate: T | FilterCallback<T>): [number, number] | null {
    const callbackFn: FilterCallback<T> | null =
      typeof predicate === 'function' ? (predicate as FilterCallback<T>) : null;

    const indexes: Array<[number, number]> = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = this.get(x, y);
        if (e === null) continue;
        const flag = callbackFn ? callbackFn(e) : e === predicate;
        if (flag) indexes.push([x, y]);
      }
    }
    if (!indexes.length) return null;
    return RNG.getItem(indexes);
  }

  floodFill(startX: number, startY: number, e: T, topology: 4 | 6 | 8 = 8) {
    const t = this.get(startX, startY);
    const dirs = DIRS[topology];

    const stack = [[startX, startY]];
    while (stack.length) {
      const current = stack.pop()!;
      const [x, y] = current;
      this.set(x, y, e);

      for (let i = 0; i < dirs.length; i++) {
        const [dx, dy] = dirs[i];
        const [xx, yy] = [x + dx, y + dy];
        if (this.get(xx, yy) === t) {
          stack.push([xx, yy]);
        }
      }
    }
  }

  toMapString() {
    let map = ``;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = this.get(x, y);
        map += e?.toString() || ' ';
      }
      map += '\n';
    }
    return map;
  }

  toArray() {
    return [...this.data];
  }

  fromArray(data: T[]) {
    this.data = [...data];
  }

  clone() {
    const matrix = new Matrix<T>(this.width, this.height);
    matrix.data = this.toArray();
    return matrix;
  }

  copyFrom(matrix: Matrix<T>) {
    this.data = matrix.toArray();
  }
}
