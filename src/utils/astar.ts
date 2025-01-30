interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  prev: Node | null;
}

export default class AStar {
  _todo: Node[] = [];
  _done: Record<string, Node> = {};

  _dirs: number[][];

  _passableCallback: (x: number, y: number) => boolean;
  _h: (x: number, y: number) => number;
  _g: (x: number, y: number) => number;

  constructor(
    passableCallback: typeof this._passableCallback,
    h: typeof this._h,
    g: typeof this._g,
  ) {
    this._h = h;
    this._g = g;
    this._passableCallback = passableCallback;
    this._dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
    ];
  }

  _getNeighbors(cx: number, cy: number) {
    const result = [];
    for (let i = 0; i < this._dirs.length; i++) {
      const dir = this._dirs[i];
      const x = cx + dir[0];
      const y = cy + dir[1];
      if (!this._passableCallback(x, y)) {
        continue;
      }
      result.push([x, y]);
    }
    return result;
  }

  /**
   * Compute a path from a given point
   * @see ROT.Path#compute
   */
  compute(fromX: number, fromY: number) {
    this._todo = [];
    this._done = {};
    this._add(fromX, fromY, null);

    let finalNode: Node | null = null;

    while (this._todo.length) {
      const item = this._todo.shift()!;
      const id = item.x + ',' + item.y;
      if (id in this._done) {
        continue;
      }
      this._done[id] = item;
      if (this._h(item.x, item.y) == 0) {
        finalNode = item;
        break;
      }
      const neighbors = this._getNeighbors(item.x, item.y);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const x = neighbor[0];
        const y = neighbor[1];
        const id = x + ',' + y;
        if (id in this._done) {
          continue;
        }
        this._add(x, y, item);
      }
    }

    const path: Array<[number, number]> = [];
    let item: Node | null = finalNode;
    if (!item) {
      return path;
    }
    while (item) {
      path.push([item.x, item.y]);
      item = item.prev;
    }
    return path;
  }

  _add(x: number, y: number, prev: Node | null) {
    const h = this._h(x, y);
    const g = this._g(x, y);
    const obj = {
      x: x,
      y: y,
      prev: prev,
      g: prev ? prev.g + g : 0,
      h: h,
    };
    /* insert into priority queue */
    const f = obj.g + obj.h;
    for (let i = 0; i < this._todo.length; i++) {
      const item = this._todo[i];
      const itemF = item.g + item.h;
      if (f < itemF || (f == itemF && h < item.h)) {
        this._todo.splice(i, 0, obj);
        return;
      }
    }
    this._todo.push(obj);
  }
}
