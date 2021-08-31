import { Entities } from "../libs/Entity.ts";
import { SystemsAndComponents,SystemOrComponentYamlObject,Component,System } from "./SystemAndComponent.ts";
import { BucId,Buc,SucId,Suc,SUCSummaryYamlObject } from "./Usecase.ts";

export class Models {
  constructor(
    readonly systemsAndComponents: SystemsAndComponents,
    readonly bucs: Entities<BucId, Buc>,
    readonly sucs: Entities<SucId, Suc>
  ) {}
  filter(bucFilter: BucId[]): Models {
    return new Models(
      this.systemsAndComponents,
      this.bucs,
      this.sucs.filter(v => v.containsBucs(bucFilter))
    )
  }
}

export function createModels(systemYamlObjects: SystemOrComponentYamlObject[], usecaseYamlObjects: any[]): Models {
  const components = new Entities(systemYamlObjects.filter(v => Component.isSameType(v)).map(v => Component.create(v)))
  const childCountMap = components.reduce((memo, v) => {
    const key = v.systemId.stringValue;
    if(!memo[key]) {
      memo[key] = 0;
    }
    memo[key]++;
    return memo;
  }, {} as {[key:string]:number})
  const systemsAndComponents = SystemsAndComponents.create(
    new Entities(systemYamlObjects.filter(v => System.isSameType(v)).map(v => System.create(v, childCountMap[v.id] || 0))),
    components
  )
  const bucs = new Entities<BucId, Buc>(usecaseYamlObjects.filter(v => Buc.isSameType(v)).map(v => Buc.create(v)))
  const usecaseMap = usecaseYamlObjects.filter(v => Suc.isSameType(v)).map(v => v as SUCSummaryYamlObject).reduce((memo, v) => {memo[v.id] = v; return memo}, {} as {[key: string]: SUCSummaryYamlObject})
  const sucs = new Entities<SucId, Suc>(usecaseYamlObjects.filter(v => Suc.isSameType(v)).map(v => Suc.create(v, usecaseMap)))
  return new Models(systemsAndComponents, bucs, sucs)
}