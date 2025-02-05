export interface AStarNode<STATE> {
  g: number;
  h: number;
  s: STATE;
  prev: AStarNode<STATE> | null;
}

interface Options<STATE> {
  hurestic: (s: STATE) => number;
  cost: (s: STATE) => number;
  neighbors: (s: STATE) => Array<STATE>;
  debug?: (node: AStarNode<STATE>) => void | Promise<void>;
  maxIterations?: number;
}

export default class AStar<STATE> {
  private h: Options<STATE>['hurestic'];
  private g: Options<STATE>['cost'];
  private n: Options<STATE>['neighbors'];
  private d: Options<STATE>['debug'] = () => {};
  private maxIterations: number = 50000;

  private todo: AStarNode<STATE>[] = [];
  private done: Record<string, AStarNode<STATE>> = {};

  constructor(options: Options<STATE>) {
    this.h = options.hurestic;
    this.g = options.cost;
    this.n = options.neighbors;
    this.d = options.debug || this.d;
    this.maxIterations = options.maxIterations || this.maxIterations;
  }

  private getId(s: STATE) {
    return JSON.stringify(s);
  }

  /**
   * Compute a path from a given point, ends when h(x, y) == 0
   */
  async compute(s: STATE) {
    this.todo = [];
    this.done = {};
    this.add(s, null);

    let finalNode: AStarNode<STATE> | null = null;

    let i = 0;

    // TODO: add a limit to the number of iterations
    while (this.todo.length) {
      if (i++ > this.maxIterations) {
        console.log('Max iterations reached');
        return [];
      }
      const item = this.todo.shift()!;
      const id = this.getId(item.s);
      if (id in this.done) {
        continue;
      }
      this.done[id] = item;
      if (item.h == 0) {
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
        const obj = this.add(n, item);
        await this.d?.(obj);
      }
    }

    const path: Array<STATE> = [];
    let item: AStarNode<STATE> | null = finalNode;
    if (!item) {
      return path;
    }
    while (item) {
      path.push(item.s);
      item = item.prev;
    }
    return path;
  }

  private add(s: STATE, prev: AStarNode<STATE> | null): AStarNode<STATE> {
    const h = this.h(s);
    const g = this.g(s);
    const obj: AStarNode<STATE> = {
      prev,
      g: prev ? prev.g + g : 0,
      h,
      s
    };
    /* insert into priority queue */
    const f = obj.g + obj.h;
    for (let i = 0; i < this.todo.length; i++) {
      const item = this.todo[i];
      const itemF = item.g + item.h;
      if (f < itemF || (f == itemF && h < item.h)) {
        this.todo.splice(i, 0, obj);
        return obj;
      }
    }
    this.todo.push(obj);
    return obj;
  }
}
