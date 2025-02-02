interface Node<STATE> {
  g: number;
  h: number;
  s: STATE;
  prev: Node<STATE> | null;
}

interface Options<STATE> {
  hurestic: (s: STATE) => number;
  cost: (s: STATE) => number;
  neighbors: (s: STATE) => Array<STATE>;
}

export default class AStar<STATE> {
  private h: (s: STATE) => number;
  private g: (s: STATE) => number;
  private n: (s: STATE) => Array<STATE>;

  private todo: Node<STATE>[] = [];
  private done: Record<string, Node<STATE>> = {};

  constructor(options: Options<STATE>) {
    this.h = options.hurestic;
    this.g = options.cost;
    this.n = options.neighbors;
  }

  private getId(s: STATE) {
    return JSON.stringify(s);
  }

  /**
   * Compute a path from a given point, ends when h(x, y) == 0
   */
  compute(s: STATE) {
    this.todo = [];
    this.done = {};
    this.add(s, null);

    let finalNode: Node<STATE> | null = null;

    while (this.todo.length) {
      const item = this.todo.shift()!;
      const id = this.getId(item.s);
      if (id in this.done) {
        continue;
      }
      this.done[id] = item;
      if (this.h(item.s) == 0) {
        finalNode = item;
        break;
      }
      const neighbors = this.n(item.s);
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        const id = this.getId(n);
        if (id in this.done) {
          continue;
        }
        this.add(n, item);
      }
    }

    const path: Array<STATE> = [];
    let item: Node<STATE> | null = finalNode;
    if (!item) {
      return path;
    }
    while (item) {
      path.push(item.s);
      item = item.prev;
    }
    return path;
  }

  private add(s: STATE, prev: Node<STATE> | null) {
    const h = this.h(s);
    const obj: Node<STATE> = {
      prev,
      g: prev ? prev.g + this.g(s) : 0,
      h,
      s,
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
