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

# データフォーマット
※例はyaml
## system
key | 型 | 必須 | 説明
---|---|---|---
type | string | o | 固定値：`system`
id | string | o | システムID
name | string | o | システム名
actorType | string | | アクタータイプ。system, boundary, その他plantumlのアイコンで使える値。未設定の場合はsystemになる
place | string | | システムの場所

例
```yaml
type: system
id: サービス管理
name: サービス管理
```

## component
key | 型 | 必須 | 説明
---|---|---|---
type | string | o | 固定値：`component`
id | string | o | コンポーネントID
name | string | o | コンポーネント名
systemId | string | o | システムID。親。
actorType | string | | アクタータイプ。system, boundary, その他plantumlのアイコンで使える値。未設定の場合はsystemになる
place | string | | システムの場所

例
```yaml
type: component
id: サービス管理メイン
name: サービス管理メイン
place: AWS
systemId: サービス管理
actorType: system
```

## buc
key | 型 | 必須 | 説明
---|---|---|---
type | string | o | 固定値：`buc`
id | string | o | BUCID
name | string | o | BUC名

例
```yaml
type: buc
id: 入会
name: 入会
```

## suc
key | 型 | 必須 | 説明
---|---|---|---
type | string | o | 固定値：`suc`
id | string | o | BUCID
name | string | o | BUC名
systemId | string | o | 関係するシステムID（主語）
buc | string[] | o | 関係するBUC。複数。
dependences | (sucId \| SubUsecase)[] |  | 関係するユースケース。アクセス先SUC、または、ここで直接定義するユースケース。

例
```yaml
type: suc
id: サビ管メイン_申込
name: 申込
systemId: サービス管理メイン
buc: 
- 入会
dependences:
- 他社連携_申込
```

# SubUsecase
SUCの中で使うオブジェクト。
key | 型 | 必須 | 説明
---|---|---|---
systemId | string | o | 依存先のシステムID または コンポーネントID
uc | string | o | ユースケース名


# 開発者用
## bundle
```
deno bundle ./src/CompoComp.ts ./docs/CompoComp.js
```