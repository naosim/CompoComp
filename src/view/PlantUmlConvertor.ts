import { Models } from "../model/Models.ts";
import { SystemOrComponent } from "../model/SystemAndComponent.ts";
import { AggregateType } from "./AggregateType.ts";

export class PlanUmlConverter {
  convert(models: Models, options?: {aggregateType?: AggregateType, displayUsecaseName?: boolean, title?: string}): string {
    options = options || {}
    const aggregateType = options.aggregateType || AggregateType.none;
    const displayUsecaseName = options.displayUsecaseName === false ? false : true;// デフォルトTrue
    const title = options.title || ''

    var systemsAndComponents = models.systemsAndComponents;
    const bucs = models.bucs
    const sucs = models.sucs

    if(aggregateType == AggregateType.aggregate) {
      systemsAndComponents = systemsAndComponents.aggregateSystem()
    } else if(aggregateType == AggregateType.aggregateWithoutBoundary) {
      systemsAndComponents = systemsAndComponents.aggregateSystemWithoutBoundary()
    }
    var plantuml: string[] = ['@startuml ' + title];
    if(aggregateType == AggregateType.none) {
      systemsAndComponents.findAll().filter(v => v.isComponent || v.isSingleSystem()).forEach((v) => plantuml.push(toPlantUml(v)))
    } else {
      systemsAndComponents.findAll().forEach((v) => plantuml.push(toPlantUml(v)))
    }

    const depsMap: {[key: string]: string[]} = {};
    sucs.forEach(v => {
      v.dependences.forEach(d => {
        const left = systemsAndComponents.findComponentIdOrSystemId(d.currentSystemId)
        const right = systemsAndComponents.findComponentIdOrSystemId(d.targetSystemId)
        if(left.stringValue == right.stringValue) {
          return;
        }
        if(!depsMap[`${left.stringValue} --> ${right.stringValue}`]) {
          depsMap[`${left.stringValue} --> ${right.stringValue}`] = []
        }
        depsMap[`${left.stringValue} --> ${right.stringValue}`].push(d.usecaseName)
      })
    })
    Object.keys(depsMap).forEach(key => {
      const usecaseName = displayUsecaseName ? `: ${depsMap[key].join(',\\n')}` : ''
      plantuml.push(`${key}${usecaseName}`)
    });



    plantuml.push('@enduml')
    return plantuml.join('\n')
  }
}

export function toPlantUml(v: SystemOrComponent): string {
  var objType = 'rectangle';
  if(v.actorType && v.actorType != 'system') {
    objType = v.actorType;
  }
  // if(v.actorType && v.actorType == 'boundary') {
  //   objType = 'boundary';
  // }
  // if(v.actorType && v.actorType == 'folder') {
  //   objType = 'folder';
  // }
  // if(v.actorType && v.actorType == 'actor') {
  //   objType = 'actor';
  // }
  const stereotype = v.isComponent ? `<<${v.systemId!.stringValue}>>` : ''
  if(!v.place) {
      return `${objType} "${v.name}" ${stereotype} as ${v.id.value}`
    }
    return `
frame ${v.place} {
  ${objType} "${v.name}" ${stereotype} as ${v.id.value}
}
  `.trim()
}