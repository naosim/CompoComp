export class Cache<T> {
  private readonly map: {[key: string]: T} = {};
  put(key: string, value: T): T {
    this.map[key] = value;
    return value;
  }
  contains(key: string): boolean {
    return !!this.map[key]
  }
  get(key: string): T {
    return this.map[key]
  }
}

export function toMap(ary: string[]): {[key:string]:boolean} {
  return ary.reduce((memo, v) => {memo[v] = true; return memo}, {} as {[key:string]:boolean})
}

/**
 * たばねる
 */
export class Bundle<T> {
  private readonly map: {[key: string]: T[]} = {};
  put(key: string, value: T): Bundle<T> {
    if(!this.map[key]) {
      this.map[key] = []
    }
    this.map[key].push(value);
    return this;
  }
  contains(key: string): boolean {
    return !!this.map[key]
  }
  get(key: string): T[] {
    return this.map[key]
  }
  forEach(cb:(key: string, value: T[]) => void) {
    Object.keys(this.map).forEach(k => cb(k, this.map[k]))
  }
}

export function  mapkv<S, T>(obj: {[key: string]: S}, cb: (k: string, v: S) => T): {[key: string]: T} {
  return Object.keys(obj).reduce((memo: {[key: string]: T}, k: string) => {
    memo[k] = cb(k, obj[k]);
    return memo;
  }, {})
}