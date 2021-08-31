export const usecaseDataText = `
- type: buc
  id: 入会
  name: 入会

- type: suc
  id: user_入会
  name: 入会
  systemId: ユーザ
  buc: 
  - 入会
  dependences:
  - ユーザ向け画面_入会


- type: suc
  id: ユーザ向け画面_入会
  name: 入会
  systemId: ユーザ向け画面
  buc: 
  - 入会
  dependences:
  - systemId: 会員管理
    uc: 入会
  - サビ管メイン_申込

- type: suc
  id: サビ管メイン_申込
  name: 申込
  systemId: サービス管理メイン
  buc: 
  - 入会
  dependences:
  - 他社連携_申込

- type: suc
  id: 他社連携_申込
  name: 申込
  systemId: 他社連携
  buc: 
  - 入会
  dependences:
  - 他社_申込

- type: suc
  id: 他社_申込
  name: 申込
  systemId: 他社システム
  buc: 
  - 入会

# 開始系
- type: suc
  id: オペ_申込参照
  name: 申込参照
  systemId: オペレータ
  buc: 
  - 入会
  dependences:
  - オペ向け画面_申込参照

- type: suc
  id: オペ向け画面_申込参照
  name: 申込参照
  systemId: オペレータ向け画面
  buc: 
  - 入会
  dependences:
  - 他社状況_参照

- type: suc
  id: 他社状況_参照
  name: 参照
  systemId: 他社状況管理
  buc: 
  - 入会

- type: suc
  id: オペ_開始
  name: 開始
  systemId: オペレータ
  buc: 
  - 入会
  dependences:
  - オペ向け画面_開始

- type: suc
  id: オペ向け画面_開始
  name: 開始
  systemId: オペレータ向け画面
  buc: 
  - 入会
  dependences:
  - サビ管メイン_開始

- type: suc
  id: サビ管メイン_開始
  name: 開始
  systemId: サービス管理メイン
  buc: 
  - 入会
  dependences:
  - 他社連携_開始

- type: suc
  id: 他社連携_開始
  name: 開始
  systemId: 他社連携
  buc: 
  - 入会
  dependences:
  - 他社_開始

- type: suc
  id: 他社_開始
  name: 開始
  systemId: 他社システム
  buc: 
  - 入会
`.trim()