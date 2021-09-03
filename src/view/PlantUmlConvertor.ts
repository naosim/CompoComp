import { Models } from "../model/Models.ts";
import { ComponentStyles, Style } from "../model/Style.ts";
import { ComponentId, SystemOrComponent } from "../model/SystemAndComponent.ts";
import { AggregateType } from "./AggregateType.ts";

export class PlanUmlConverter {
  convert(
    models: Models,
    options?: {
      aggregateType?: AggregateType;
      displayUsecaseName?: boolean;
      title?: string;
    },
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
    var plantuml: string[] = ["@startuml " + title];
    if (aggregateType == AggregateType.none) {
      systemsAndComponents.findAll().filter((v) =>
        v.isComponent || v.isSingleSystem()
      ).forEach((v) => plantuml.push(toPlantUml(v, models.componentStyles)));
    } else {
      systemsAndComponents.findAll().forEach((v) =>
        plantuml.push(toPlantUml(v, models.componentStyles))
      );
    }

    const depsMap: { [key: string]: string[] } = {};
    sucs.forEach((v) => {
      v.dependences.forEach((d) => {
        const left = systemsAndComponents.findComponentIdOrSystemId(
          d.currentSystemId,
        );
        const right = systemsAndComponents.findComponentIdOrSystemId(
          d.targetSystemId,
        );
        if (left.stringValue == right.stringValue) {
          return;
        }
        if (!depsMap[`${left.stringValue} --> ${right.stringValue}`]) {
          depsMap[`${left.stringValue} --> ${right.stringValue}`] = [];
        }
        depsMap[`${left.stringValue} --> ${right.stringValue}`].push(
          d.usecaseName,
        );
      });
    });
    Object.keys(depsMap).forEach((key) => {
      const usecaseName = displayUsecaseName
        ? `: ${depsMap[key].join(",\\n")}`
        : "";
      plantuml.push(`${key}${usecaseName}`);
    });

    plantuml.push("@enduml");
    return plantuml.join("\n");
  }
}

function convertStyle(style: Style): string {
  return "#" + style.map((k, v) => {
    if (k == "fill") {
      return v.value;
    }
    if (k == "stroke") {
      return `line:${v.value}`;
    }
    return null;
  }).filter((v) => v).join(";"); // nullの削除
}

export function toPlantUml(
  v: SystemOrComponent,
  componentStyles: ComponentStyles,
): string {
  var objType = "rectangle";
  if (v.actorType && v.actorType != "system") {
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
  const hasStyle = v.isComponent &&
    componentStyles.contains(new ComponentId(v.id.stringValue));

  // const list = v.style.map((k, v) => {
  //   if(k == 'fill') {
  //     return v
  //   }
  //   if(k == 'stroke') {
  //     return `line:${v}`
  //   }
  //   return null
  // }).filter(v => v)// nullの削除
  // const style = list.length > 0 ? '#' + list.join(';') : ''
  const style = hasStyle
    ? convertStyle(
      componentStyles.findByComponentId(new ComponentId(v.id.stringValue))
        .style,
    )
    : "";
  const stereotype = v.isComponent ? `<<${v.systemId!.stringValue}>>` : "";
  if (!v.place) {
    return `${objType} "${v.name}" ${stereotype} as ${v.id.value} ${style}`;
  }
  return `
frame ${v.place} {
  ${objType} "${v.name}" ${stereotype} as ${v.id.value} ${style}
}
  `.trim();
}
