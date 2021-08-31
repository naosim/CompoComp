import {jsyaml} from "../src/libs/jsyaml.js";
import {CompoComp} from "../src/CompoComp.ts";
import {systemDataText} from './sample_system.js';
import {usecaseDataText as usecaseDataText_in} from './sample_usecase_in.js';
import {usecaseDataText as usecaseDataText_file} from './sample_usecase_file.js';


const list = [
  ...jsyaml.load(systemDataText),
  ...jsyaml.load(usecaseDataText_in),
  ...jsyaml.load(usecaseDataText_file)
]

const models = CompoComp.createModels(list);
const options = {
  aggregateType: 'aggregate', // none, aggregate, aggregateWithoutBoundary
  bucFilter: ['他社状況同期']   // bucの指定
};
const plantuml = CompoComp.toPlantUml(models, options)
console.log(plantuml)