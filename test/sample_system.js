export const systemDataText = `
- type: system
  id: ユーザ
  name: ユーザ
  actorType: actor

- type: system
  id: オペレータ
  name: オペレータ
  actorType: actor

- type: system
  id: ユーザ向け画面
  name: ユーザ向け画面
  actorType: boundary

- type: system
  id: 共有フォルダ
  name: 共有フォルダ
  actorType: boundary

- type: system
  id: 会員管理
  name: 会員管理

- type: system
  id: 他社システム
  name: 他社システム

- type: system
  id: サービス管理
  name: サービス管理

- type: component
  id: サービス管理メイン
  name: サービス管理メイン
  place: AWS
  systemId: サービス管理

- type: component
  id: 他社状況管理
  name: 他社状況管理
  place: AWS
  systemId: サービス管理

- type: component
  id: オペレータ向け画面
  name: オペレータ向け画面
  systemId: サービス管理
  actorType: boundary

- type: component
  id: 他社連携
  name: 他社連携
  place: GCP
  systemId: サービス管理

`.trim()