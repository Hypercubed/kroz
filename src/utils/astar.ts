interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  prev: Node | null;
}

const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1],
];

export default class AStar {
  private todo: Node[] = [];
  private done: Record<string, Node> = {};

  private dirs = DIRS;

  constructor(
    private passableCallback: (x: number, y: number) => boolean,
    private h: (x: number, y: number) => number,
    private g: (x: number, y: number) => number,
  ) {}

  private getNeighbors(cx: number, cy: number) {
    const result = [];
    for (let i = 0; i < this.dirs.length; i++) {
      const dir = this.dirs[i];
      const x = cx + dir[0];
      const y = cy + dir[1];
      if (!this.passableCallback(x, y)) {
        continue;
      }
      result.push([x, y]);
    }
    return result;
  }

  private getId(x: number, y: number) {
    return x + ',' + y;
  }

  /**
   * Compute a path from a given point, ends when h(x, y) == 0
   */
  compute(fromX: number, fromY: number) {
    this.todo = [];
    this.done = {};
    this._add(fromX, fromY, null);

    let finalNode: Node | null = null;

    while (this.todo.length) {
      const item = this.todo.shift()!;
      const id = this.getId(item.x, item.y);
      if (id in this.done) {
        continue;
      }
      this.done[id] = item;
      if (this.h(item.x, item.y) == 0) {
        finalNode = item;
        break;
      }
      const neighbors = this.getNeighbors(item.x, item.y);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const x = neighbor[0];
        const y = neighbor[1];
        const id = this.getId(x, y);
        if (id in this.done) {
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
    const h = this.h(x, y);
    const g = this.g(x, y);
    const obj = {
      x: x,
      y: y,
      prev: prev,
      g: prev ? prev.g + g : 0,
      h: h,
    };
    /* insert into priority queue */
    const f = obj.g + obj.h;
    for (let i = 0; i < this.todo.length; i++) {
      const item = this.todo[i];
      const itemF = item.g + item.h;
      if (f < itemF || (f == itemF && h < item.h)) {
        this.todo.splice(i, 0, obj);
        return;
      }
    }
    this.todo.push(obj);
  }
}
