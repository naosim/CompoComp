import { Entities } from "./libs/Entity.ts";
import {System, Component, SystemOrComponentYamlObject, SystemsAndComponents, SystemOrComponent} from './model/SystemAndComponent.ts'
import { Buc, BucId, Suc, SucId, SUCSummaryYamlObject, UsecaseYamlObject } from "./model/Usecase.ts";
import { AggregateType } from "./view/AggregateType.ts";
import { PlanUmlConverter } from "./view/PlantUmlConvertor.ts";
import { createModels as _createModels, Models } from "./model/Models.ts"

export module CompoComp {
  export function createModels(systemYamlObjects: SystemOrComponentYamlObject[], usecaseYamlObjects: any[]): Models {
    return _createModels(systemYamlObjects, usecaseYamlObjects)
  }
  export function filterModels(models: Models, bucFilter: string[]): Models {
    return models.filter(bucFilter.map(v => new BucId(v)))
  }

  export type Options = {
    aggregateType?: AggregateType
    bucFilter?: string[]
  }

  export function toPlantUml(
    models: Models, 
    options?: Options
  ): string {
    options = options || {}
    if(options.bucFilter) {
      models = models.filter(options.bucFilter.map(v => new BucId(v)))
    }
    return new PlanUmlConverter().convert(models, options)
  }
}