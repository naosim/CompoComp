import {
  assertEquals,
  assertArrayContains,
assertThrows,
} from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { CompoComp } from "../src/CompoComp.ts";
import { PlanUmlConverter } from "../src/view/PlantUmlConvertor.ts";

// Simple name and function, compact form, but not configurable
Deno.test("hello world #1", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

// Fully fledged test definition, longer form, but configurable (see below)
Deno.test({
  name: "hello world #2",
  fn: () => {
    const x = 1 + 2;
    assertEquals(x, 3);
  },
});



Deno.test({
  name: "mermaid #1",
  fn: () => {
    
    const act = CompoComp.toMermaid([
      {type: 'system', id: 'サービス管理'},
      {type: 'system', id: 'オペレータ'},

      {type: 'buc', id: 'all'},
      {type: 'suc', id: 'オペ', systemId: 'オペレータ', buc: ['all'], dependences: [{systemId: 'サービス管理', uc: 'ab'}]},
    ])
    assertEquals(act, `
graph TD
  サービス管理("サービス管理")
  オペレータ("オペレータ")
  オペレータ -->|ab| サービス管理
    `.trim());
  },
});

Deno.test({
  name: "mermaid #2 サブグラフの親要素への依存はエラー",
  fn: () => {
    const list = [
      {type: 'system', id: 'サービス管理'},
      {type: 'system', id: 'オペレータ'},

      {type: 'component', id: 'オペレータ向け画面', systemId: 'サービス管理', place: 'aws'},

      {type: 'buc', id: 'all'},
      {type: 'suc', id: 'オペ', systemId: 'オペレータ', buc: ['all'], dependences: [{systemId: 'サービス管理', uc: 'ab'}]},
    ]
    assertThrows((): void => {
      const act = CompoComp.toMermaid(list)
    }, Error, 'サブグラフの親への依存はMermaid.jsでは不可');
    
  },
});

Deno.test({
  name: "model 親のいないコンポーネントがあったらエラー",
  fn: () => {
    assertThrows((): void => {
      const act = CompoComp.createModels([
        {type: 'component', id: 'オペレータ向け画面', systemId: 'サービス管理', place: 'aws'},
      ])
    }, Error, 'systemIdに対応するsystemがありません');
  },
});

Deno.test({
  name: "model system idがない",
  fn: () => {
    assertThrows((): void => {
      const act = CompoComp.createModels([
        {type: 'system'},
      ])
    }, Error, 'IDがありません');
  },
});

Deno.test({
  name: "model component idがない",
  fn: () => {
    assertThrows((): void => {
      const act = CompoComp.createModels([
        {type: 'component', systemId: 'サービス管理', place: 'aws'},
      ])
    }, Error, 'IDがありません');
  },
});