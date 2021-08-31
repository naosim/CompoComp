export interface StringValueObject {
  readonly stringValue: string;
}

export interface Entity<T extends StringValueObject> {
  id: T;
}

export class Entities<I extends StringValueObject, E extends Entity<I>> {
  private readonly entityMap: {[key: string]: E}
  constructor(private readonly list: E[]) {
    this.entityMap = list.reduce((memo, v) => {
    memo[v.id.stringValue] = v;
    return memo;
  }, {} as {[key: string]: E});

  }
  get values(): E[] {
    return [...this.list];
  }
  findById(id: I): E {
    const result = this.entityMap[id.stringValue];
    if(!id) {
      throw new Error('存在しない: ' + id);
    }
    return result;
  }
  filter(predicate: (value: E, index: number, array: E[]) => boolean): Entities<I, E> {
    return new Entities<I, E>(this.list.filter(predicate))
  }
  map<R>(callbackfn: (value: E, index: number, array: E[]) => R): R[] {
    return this.list.map(callbackfn)
  }
  reduce<U>(callbackfn: (previousValue: U, currentValue: E, currentIndex: number, array: E[]) => U, initialValue: U): U {
    return this.list.reduce(callbackfn, initialValue);
  }
  forEach(callbackfn: (value: E, index: number, array: E[]) => void): void {
    this.list.forEach(callbackfn)
  }
  contains(id: I): boolean {
    return this.entityMap[id.stringValue] !== undefined;
  }
}