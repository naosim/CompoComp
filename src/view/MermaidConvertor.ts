import { Bundle } from "../libs/util.ts";
import { Models } from "../model/Models.ts";
import { SystemIdOrComponentId, SystemOrComponent, SystemsAndComponents } from "../model/SystemAndComponent.ts";
import { AggregateType } from "./AggregateType.ts";
import { ViewOptions } from "./ViewOptions.ts";

export class MermaidConverter {
  convert(
    models: Models,
    options?: ViewOptions,
  ): string {
    options = options || {};
    const aggregateType = options.aggregateType || AggregateType.none;
    const displayUsecaseName = options.displayUsecaseName === false
      ? false
      : true; // デフォルトTrue
    const title = options.title || "";

    var systemsAndComponents = models.systemsAndComponents;
    const bucs = models.bucs;
    const sucs = models.sucs;

    if (aggregateType == AggregateType.aggregate) {
      systemsAndComponents = systemsAndComponents.aggregateSystem();
    } else if (aggregateType == AggregateType.aggregateWithoutBoundary) {
      systemsAndComponents = systemsAndComponents
        .aggregateSystemWithoutBoundary();
    }

    var mermaid: string[] = ["graph TD"];
    const placeBundle = new Bundle<SystemOrComponent>();
    const nonePlace = "$$noneplace";
    var systemAndComponents = systemsAndComponents.findAll();
    if (aggregateType == AggregateType.none) {
      // 子を持つシステムを削除する
      systemAndComponents = systemAndComponents.filter((v) =>
        v.isComponent || v.isSingleSystem()
      );
    }
    if(aggregateType == AggregateType.groupBySystem) {
      systemAndComponents.forEach((v) =>
        placeBundle.put(v.systemId?.stringValue || "$$noneplace", v)
      );
    } else {
      systemAndComponents.forEach((v) =>
        placeBundle.put(v.place || "$$noneplace", v)
      );
    }
    
    placeBundle.forEach((p, list) => {
      if (p != nonePlace) {
        mermaid.push(`  subgraph ${p}`);
      }
      list.forEach((v) => mermaid.push("  " + toMermaid(v, options?.aggregateType != AggregateType.groupBySystem)));
      if (p != nonePlace) {
        mermaid.push(`  end`);
      }
    });

    models.componentStyles.forEach((v) => {
      const style = v.style.map((k, v) => `${k}:#${v.value}`).join(",");
      mermaid.push(`  style ${v.componentId.value} ${style}`);
    });

    const depsBundle = new Bundle<
      { left: string; right: string; usecaseName: string }
    >();
    sucs.forEach((v) => {
      v.dependences.forEach((d) => {
        const leftId =
          systemsAndComponents.findComponentIdOrSystemId(d.currentSystemId);
        const rightId =
          systemsAndComponents.findComponentIdOrSystemId(d.targetSystemId);
        MermaidConverter.validateLink(leftId, models.systemsAndComponents, aggregateType);
        MermaidConverter.validateLink(rightId, models.systemsAndComponents, aggregateType);
        const left = leftId.stringValue;
        const right = rightId.stringValue;
        const usecaseName = d.usecaseName;
        if (left == right) { // 自分自身への依存は非表示
          return;
        }
        depsBundle.put(`${left} --> ${right}`, { left, right, usecaseName });
      });
    });
    depsBundle.forEach((k, v) => {
      const usecaseName = displayUsecaseName
        ? `|${v.map((v) => v.usecaseName).join(",<br>")}|`
        : "";
      mermaid.push(`  ${v[0].left} -->${usecaseName} ${v[0].right}`);
    });

    return mermaid.join("\n");
  }
  static validateLink(
    id: SystemIdOrComponentId, 
    repository: SystemsAndComponents, 
    aggregateType: AggregateType
  ) {
    if(aggregateType !== AggregateType.none && aggregateType !== AggregateType.groupBySystem) {
      return;
    }
    const obj = repository.findByComponentIdOrSystemId(id);
    if(obj.isComponent) {
      return;
    }
    if(!obj.toSystem().hasChild) {
      return;
    }
    throw new Error('サブグラフの親への依存はMermaid.jsでは不可')
  }
}

const kakkoMap: { [key: string]: string[] } = {
  system: ["(", ")"],
  boundary: ["[\\", "/]"],
  actor: ["{{", "}}"],
};

export function toMermaid(v: SystemOrComponent, isShowStereoType: boolean): string {
  const kakko: string[] = kakkoMap[v.actorType] || ["(", ")"];
  // if(v.actorType) {
  //   if(v.actorType == 'boundary') {
  //     kakko = ['[\\', '/]']
  //   } else if(v.actorType == 'actor') {
  //     kakko = ['{{', '}}']
  //   }
  // }
  const stereoType = isShowStereoType && v.isComponent ? `${v.systemId!.stringValue}<br>` : "";
  return `${v.id.stringValue}${kakko[0]}"${stereoType}${v.name}"${kakko[1]}`;
}
