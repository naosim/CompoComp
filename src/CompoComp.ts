import { Entities } from "./libs/Entity.ts";
import {System, Component, SystemOrComponentYamlObject, SystemsAndComponents, SystemOrComponent} from './model/SystemAndComponent.ts'
import { Buc, BucId, Suc, SucId, SUCSummaryYamlObject, UsecaseYamlObject } from "./model/Usecase.ts";
import { AggregateType } from "./view/AggregateType.ts";
import { PlanUmlConverter } from "./view/PlantUmlConvertor.ts";
import { createModels as _createModels, Models } from "./model/Models.ts"

export module CompoComp {
  
  export function createModels(list: any[]): Models {
    
    return _createModels(
      list.filter(v => v.type == 'system' || v.type == 'component').map(v => v as SystemOrComponentYamlObject), 
      list.filter(v => v.type == 'buc' || v.type == 'suc').map(v => v as SystemOrComponentYamlObject)
    )
  }
  export function filterModels(models: Models, bucFilter: string[]): Models {
    return models.filter(bucFilter.map(v => new BucId(v)))
  }

  export type Options = {
    title?: string,
    aggregateType?: string
    bucFilter?: string[],
    displayUsecaseName?: boolean
  }

  export function toPlantUml(
    models: Models, 
    options?: Options
  ): string {
    options = options || {}
    if(options.bucFilter) {
      models = models.filter(options.bucFilter.map(v => new BucId(v)))
    }
    return new PlanUmlConverter().convert(models, {title: options.title, aggregateType: options.aggregateType ? options.aggregateType as AggregateType : AggregateType.none, displayUsecaseName: options.displayUsecaseName})
  }
}