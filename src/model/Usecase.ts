import {Entity, StringValueObject} from '../libs/Entity.ts';
import { toMap } from "../libs/util.ts";
import { ComponentId, SystemId, SystemIdOrComponentId } from "./SystemAndComponent.ts";

export type BUCYamlObject = {
  id: string,
  type: 'buc',
  name: string
}

export type UsecaseYamlObject = {
  systemId: string;
  uc: string;
}

export interface SUCSummaryYamlObject {
  id: string,
  name: string,
  systemId: string,// systemId or componentId
}

export interface SUCYamlObject extends SUCSummaryYamlObject {
  type: 'suc',
  buc: string[],
  dependences: (// 依存するSUC。sucIdを指定するのがベストだが、未定義の場合は自分で入れる
    UsecaseYamlObject | string /* sucId */)[]

}

export class BucId implements StringValueObject {
  readonly stringValue: string;
  constructor(readonly value: string) {
    this.stringValue = value;
  }
}

class SystemDependence {
  constructor(
    readonly currentSystemId: SystemIdOrComponentId,
    readonly targetSystemId: SystemIdOrComponentId,
    readonly usecaseName: string
  ) {}
}

export class SucId implements StringValueObject {
  readonly stringValue: string;
  constructor(readonly value: string) {
    this.stringValue = value;
  }
}

export class Buc implements Entity<BucId> {
  readonly name: string;
  constructor(readonly id: BucId, readonly obj: BUCYamlObject) {
    this.name = obj.name;
  }

  static isSameType(obj: {type: string}) {
    return obj.type == 'buc';
  }

  static create(obj: BUCYamlObject) {
    if(!Buc.isSameType(obj)) {
      throw new Error('typeが違う');
    }
    return new Buc(new BucId(obj.id), obj);
  }
}



export class Suc implements Entity<SucId> {
  readonly name: string;
  readonly bucMap: {[key: string]: boolean}
  constructor(readonly id: SucId, readonly dependences: SystemDependence[], readonly obj: SUCYamlObject) {
    this.name = obj.name;
    this.bucMap = toMap(obj.buc);
  }

  containsBucs(bucIds: BucId[]): boolean {
    return bucIds.filter(v => this.bucMap[v.stringValue]).length > 0
  }

  static isSameType(obj: {type: string}) {
    return obj.type == 'suc';
  }

  static create(obj: SUCYamlObject, usecaseMap: {[key: string]: SUCSummaryYamlObject}) {
    if(!Suc.isSameType(obj)) {
      throw new Error('typeが違う');
    }
    if(!obj.dependences) {
      obj.dependences = []
    }
    const deps = obj.dependences.map(v => {
      var dep: UsecaseYamlObject;
      if(typeof v == 'string') {
        if(!usecaseMap[v]) {
          throw new Error('未定義のユースケース: ' + v);
        }
        const summary = usecaseMap[v];
        dep = {
          systemId: summary.systemId,
          uc: summary.name
        };
      } else {
        dep = v as UsecaseYamlObject;
      }
      return new SystemDependence(
        new SystemIdOrComponentId(obj.systemId),
        new SystemIdOrComponentId(dep.systemId),
        dep.uc
      )
    })
    return new Suc(new SucId(obj.id), deps, obj);
  }
}

