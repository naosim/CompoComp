# CompoComp
コンポーネントとユースケースを記述したデータから見たい粒度の図を生成する

# import用モジュール
```js
import {CompoComp} from "https://naosim.github.io/CompoComp/CompoComp.js";
```

# sample
```js
const list = [];// 要定義

const models = CompoComp.createModels(list);
const options = {
  title: '他社状況同期のシステム関係図',
  aggregateType: 'aggregate', // none, aggregate, aggregateWithoutBoundary
  bucFilter: ['他社状況同期'],  // bucの指定
  displayUsecaseName: false   // ユースケース名の表示
};
const plantuml = CompoComp.toPlantUml(models, options);
console.log(plantuml);
```
