type FillCallback<T> = (x: number, y: number, i: number) => T;
type ForEachCallback<T> = (x: number, y: number, e: T) => void;
type ForEachAsyncCallback<T> = (x: number, y: number, e: T) => Promise<void>;
type MapCallback<T, R> = (e: T | null, x: number, y: number, i: number) => R;

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

  private data: T[] = [];

  constructor(
    public width: number,
    public height: number
  ) {}

  protected getIndex(x: number, y: number): number {
    return y * this.width + x;
  }

  get(x: number, y: number): T | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    const index = this.getIndex(x, y);
    return this.data[index];
  }

  set(x: number, y: number, item: T): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const index = this.getIndex(x, y);
    this.data[index] = item;
  }

  fill(value: T | FillCallback<T>): void {
    let cb: FillCallback<T> | null = null;
    if (typeof value === 'function') cb = value as FillCallback<T>;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = this.getIndex(x, y);
        this.set(x, y, (cb ? cb(x, y, i) : value) as T);
      }
    }
  }

  map<R>(cb: MapCallback<T, R>) {
    const matrix = new Matrix<R>(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = this.getIndex(x, y);
        const e = this.get(x, y);
        matrix.set(x, y, cb(e, x, y, i));
      }
    }
    return matrix;
  }

  forEach(callback: ForEachCallback<T>) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (!e) continue;
        callback(x, y, e);
      }
    }
  }

  async forEachAsync(callback: ForEachAsyncCallback<T>) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const e = this.get(x, y);
        if (!e) continue;
        await callback(x, y, e);
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
}
