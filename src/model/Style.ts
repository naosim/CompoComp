import { mapkv } from "../libs/util.ts";
import { ComponentId } from "./SystemAndComponent.ts";

export type ComponentStyleYamlObject = {
  type: "componentStyle";
  name?: string;
  componentId: string;
  style: { [key: string]: string };
};

export class ComponentStyle {
  constructor(
    readonly componentId: ComponentId,
    readonly style: Style,
  ) {}

  static create(obj: ComponentStyleYamlObject): ComponentStyle {
    return new ComponentStyle(
      new ComponentId(obj.componentId),
      new Style(mapkv(obj.style, (k, v: string) => new Color(v))),
    );
  }
}
export class Style {
  constructor(private readonly value: { [key: string]: Color }) {
  }

  map<T>(cb: (k: string, v: Color) => T): T[] {
    return Object.keys(this.value).map((k) => cb(k, this.value[k]));
  }
}

export class Color {
  constructor(readonly value: string) {
  }
}

export class ComponentStyles {
  valuesMap: { [key: string]: ComponentStyle };
  constructor(readonly values: ComponentStyle[]) {
    this.valuesMap = values.reduce((memo, v) => {
      memo[v.componentId.stringValue] = v;
      return memo;
    }, {} as { [key: string]: ComponentStyle });
  }
  forEach(cb: (v: ComponentStyle) => void) {
    this.values.forEach(cb);
  }
  findByComponentId(componentId: ComponentId): ComponentStyle {
    return this.valuesMap[componentId.stringValue];
  }
  contains(componentId: ComponentId): boolean {
    return !!this.valuesMap[componentId.stringValue];
  }
}
