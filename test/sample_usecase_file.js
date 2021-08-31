export const usecaseDataText = `
- type: buc
  id: 他社状況同期
  name: 他社状況同期

- type: suc
  id: オペ_他社状況ファイル取得
  name: 他社状況ファイル取得
  systemId: オペレータ
  buc: 
  - 他社状況同期
  dependences:
  - systemId: 他社システム
    uc: 他社状況ファイル取得

- type: suc
  id: オペ_他社状況ファイル設置
  name: 他社状況ファイル設置
  systemId: オペレータ
  buc: 
  - 他社状況同期
  dependences:
  - systemId: 共有フォルダ
    uc: 状況ファイル設置

- type: suc
  id: 他社状況管理_他社状況ファイル取込
  name: 他社状況ファイル取込
  systemId: 他社状況管理
  buc: 
  - 他社状況同期
  dependences:
  - systemId: 共有フォルダ
    uc: 状況ファイル取込

`.trim()