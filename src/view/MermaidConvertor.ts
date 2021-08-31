import { Bundle } from "../libs/util.ts";
import { Models } from "../model/Models.ts";
import { SystemOrComponent } from "../model/SystemAndComponent.ts";
import { AggregateType } from "./AggregateType.ts";

export class MermaidConverter {
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

    var mermaid: string[] = ['graph TD'];
    if(aggregateType == AggregateType.none) {
      systemsAndComponents.findAll().filter(v => v.isComponent || v.isSingleSystem()).forEach((v) => mermaid.push('  ' + toMermaid(v)))
    } else {
      systemsAndComponents.findAll().forEach((v) => mermaid.push('  ' + toMermaid(v)))
    }
    

    const depsBundle = new Bundle<{left: string, right: string, usecaseName: string}>()
    sucs.forEach(v => {
      v.dependences.forEach(d => {
        const left = systemsAndComponents.findComponentIdOrSystemId(d.currentSystemId).stringValue
        const right = systemsAndComponents.findComponentIdOrSystemId(d.targetSystemId).stringValue
        const usecaseName = d.usecaseName
        if(left == right) {// 自分自身への依存は非表示
          return;
        }
        depsBundle.put(`${left} --> ${right}`, {left, right, usecaseName})
      })
    })
    depsBundle.forEach((k, v) => {
      const usecaseName = displayUsecaseName ? `|${v.map(v => v.usecaseName).join(',<br>')}|` : ''
      mermaid.push(`  ${v[0].left} -->${usecaseName} ${v[0].right}`)
    })

    return mermaid.join('\n')
  }
}

export function toMermaid(v: SystemOrComponent): string {
  var kakko = ['(', ')']
  if(v.actorType) {
    if(v.actorType == 'boundary') {
      kakko = ['[\\', '/]']
    } else if(v.actorType == 'actor') {
      kakko = ['{{', '}}']
    }
  }
  const stereoType = v.isComponent ? `${v.systemId!.stringValue}<br>` : ''
  const place = v.place ? `<br>@${v.place}` : ''
  return `${v.id.stringValue}${kakko[0]}"${stereoType}${v.name}${place}"${kakko[1]}`
}