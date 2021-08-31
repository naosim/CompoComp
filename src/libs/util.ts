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