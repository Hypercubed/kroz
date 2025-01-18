// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
interface Component<T> extends Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

export class Entity {
  protected _components = new Map<string, object>();
  protected _tags = new Set<string | symbol>();

  constructor(public readonly type: number | string) {}

  add<T extends object>(x: T): this;
  add(x: symbol | string): this;
  add(x: object | symbol | string): this {
    if (typeof x === 'symbol' || typeof x === 'string') {
      this._tags.add(x);
      return this;
    }
    this._components.set(x.constructor.name, x);
    return this;
  }

  get<T extends object>(x: Component<T>): T | undefined {
    return this._components.get(x.name) as T;
  }

  has(x: symbol | string): boolean;
  has<T extends object>(x: Component<T>): boolean;
  has(x: Component<object> | symbol | string): boolean {
    if (typeof x === 'symbol' || typeof x === 'string') {
      return this._tags.has(x);
    }
    return this._components.has(x.name);
  }

  remove(x: symbol | string): boolean;
  remove<T extends object>(x: Component<T>): boolean;
  remove(x: Component<object> | symbol | string): boolean {
    if (typeof x === 'symbol' || typeof x === 'string') {
      return this._tags.delete(x);
    }
    return this._components.delete(x.name);
  }
}
