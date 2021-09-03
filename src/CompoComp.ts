import { SystemOrComponentYamlObject } from "./model/SystemAndComponent.ts";
import { BucId } from "./model/Usecase.ts";
import { AggregateType } from "./view/AggregateType.ts";
import { PlanUmlConverter } from "./view/PlantUmlConvertor.ts";
import { createModels as _createModels, Models } from "./model/Models.ts";
import { MermaidConverter } from "./view/MermaidConvertor.ts";
import { ComponentStyleYamlObject } from "./model/Style.ts";

export module CompoComp {
  /**
   * モデルを生成する
   * @param list データフォーマットに従ったオブジェクトのリスト
   * @returns
   */
  export function createModels(list: any[]): Models {
    return _createModels(
      list.filter((v) => v.type == "system" || v.type == "component").map((v) =>
        v as SystemOrComponentYamlObject
      ),
      list.filter((v) => v.type == "buc" || v.type == "suc").map((v) =>
        v as SystemOrComponentYamlObject
      ),
      list.filter((v) => v.type == "componentStyle").map((v) =>
        v as ComponentStyleYamlObject
      ),
    );
  }
  export function filterModels(models: Models, bucFilter: string[]): Models {
    return models.filter(bucFilter.map((v) => new BucId(v)));
  }

  /**
   * 表示オプション
   */
  export type Options = {
    title?: string;
    aggregateType?: string;
    bucFilter?: string[];
    displayUsecaseName?: boolean;
  };

  /**
   * モデルからPlantUMLを生成する
   * @param modelsOrObjects
   * @param options
   * @returns
   */
  export function toPlantUml(
    modelsOrObjects: Models | any[],
    options?: Options,
  ): string {
    return toView(modelsOrObjects, new PlanUmlConverter(), options);
  }

  /**
   * モデルからMermaid.jsを生成する
   * @param models
   * @param options
   * @returns
   */
  export function toMermaid(
    modelsOrObjects: Models | any[],
    options?: Options,
  ): string {
    return toView(modelsOrObjects, new MermaidConverter(), options);
  }

  /**
   * モデルをスクリプトに変換する
   */
  type ViewConvertor = {
    convert(
      models: Models,
      options?: {
        aggregateType?: AggregateType;
        displayUsecaseName?: boolean;
        title?: string;
      },
    ): string;
  };

  export function toView(
    modelsOrObjects: Models | any[],
    convertor: ViewConvertor,
    options?: Options,
  ): string {
    options = options || {};
    var models: Models = !Array.isArray(modelsOrObjects)
      ? modelsOrObjects
      : createModels(modelsOrObjects);
    if (options.bucFilter) {
      models = models.filter(options.bucFilter.map((v) => new BucId(v)));
    }
    return convertor.convert(models, {
      title: options.title,
      aggregateType: options.aggregateType
        ? options.aggregateType as AggregateType
        : AggregateType.none,
      displayUsecaseName: options.displayUsecaseName,
    });
  }
}
