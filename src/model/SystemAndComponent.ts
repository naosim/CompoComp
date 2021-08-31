import {Entities, Entity, StringValueObject} from '../libs/Entity.ts';
import {Cache} from '../libs/util.ts';

export type SystemOrComponentYamlObject = {
  id: string,
  type: 'system' | 'component',
  name: 'string',
  systemId?: string, // typeがsystemなら存在不可、componentなら必須
  actorType?: string,
  place?: string
}

export class SystemId implements StringValueObject {
  readonly stringValue: string;
  private _SystemId: any;
  constructor(readonly value: string) {
    this.stringValue = value;
  }
}

export class ComponentId implements StringValueObject {
  readonly stringValue: string;
  private _ComponentId: any;
  constructor(readonly value: string) {
    this.stringValue = value;
  }
}

export class SystemIdOrComponentId implements StringValueObject {
  readonly stringValue: string;
  private _SystemIdOrComponentId: any;
  constructor(readonly value: string) {
    this.stringValue = value;
  }
}

export class System implements Entity<SystemId> {
  readonly isBoundary: boolean;
  readonly name: string;
  readonly actorType?: string;
  readonly place?: string;
  readonly hasChild: boolean;
  constructor(readonly id: SystemId, readonly childCount: number, readonly obj: SystemOrComponentYamlObject) {
    this.isBoundary = obj.actorType !== undefined && obj.actorType == 'boundary';
    this.name = obj.name;
    this.actorType = obj.actorType;
    this.place = obj.place;
    this.hasChild = childCount > 0;
  }

  static isSameType(obj: SystemOrComponentYamlObject) {
    return obj.type == 'system';
  }

  static create(obj: SystemOrComponentYamlObject, childCount: number) {
    if(!System.isSameType(obj)) {
      throw new Error('typeが違う');
    }
    if(obj.systemId) {
      throw new Error('systemにsystemIdがあってはならない')
    }
    return new System(new SystemId(obj.id), childCount, obj);
  }
}

export class Component implements Entity<ComponentId> {
  readonly isBoundary: boolean;
  readonly name: string;
  readonly actorType?: string;
  readonly place?: string;
  constructor(readonly id: ComponentId, readonly systemId: SystemId, readonly isSystemAggregated: boolean, readonly obj: SystemOrComponentYamlObject) {
    this.isBoundary = obj.actorType !== undefined && obj.actorType == 'boundary';
    this.name = obj.name;
    this.actorType = obj.actorType;
    this.place = obj.place;
  }

  /**
   * システムに集約する
   */
  aggregateSystem(): Component {
    return new Component(
      this.id,
      this.systemId,
      true,// フラグ立てる
      this.obj
    )
  }

  static isSameType(obj: SystemOrComponentYamlObject) {
    return obj.type == 'component';
  }

  static create(obj: SystemOrComponentYamlObject) {
    if(!Component.isSameType(obj)) {
      throw new Error('typeが違う');
    }
    if(!obj.systemId) {
      throw new Error('componentにsystemIdがない')
    }
    return new Component(new ComponentId(obj.id), new SystemId(obj.systemId!), false, obj);
  }
}

export class SystemOrComponent implements Entity<SystemIdOrComponentId> {
  readonly id: SystemIdOrComponentId;
  private readonly value: System | Component;
  readonly name: string;
  readonly actorType?: string;
  readonly place?: string;
  readonly systemId?: SystemId;
  readonly isSystem: boolean;
  readonly isComponent: boolean;
  private constructor(
    private readonly system?: System, 
    private readonly component?: Component
  ) {
    this.value = system || component!
    this.id = new SystemIdOrComponentId(this.value.id.stringValue)
    this.name = this.value.name;
    this.actorType = this.value.actorType;
    this.isSystem = !!system
    this.isComponent = !!component
    if(this.isComponent) {
      this.place = component!.place
      this.systemId = component!.systemId
    }
  }

  /**
   * 子（コンポーネント）を持たないシステムかどうか？
   * 補足：コンポーネントの場合はfalseを返す
   * @returns 
   */
  isSingleSystem() {
    return this.isSystem && this.system!.childCount == 0;
  }
  static ofSystem(system: System): SystemOrComponent {
    return new SystemOrComponent(system);
  }
  static ofComponent(component: Component): SystemOrComponent {
    return new SystemOrComponent(undefined, component);
  }
}

export class SystemsAndComponents {
  private readonly cache = new Cache<SystemIdOrComponentId>();
  private noneAggregateComponents: Entities<ComponentId, Component>;
  private constructor(
    readonly systems: Entities<SystemId, System>, 
    readonly components: Entities<ComponentId, Component>
  ) {
    this.noneAggregateComponents = components.filter(v => !v.isSystemAggregated)
  }
  
  static create(systems: Entities<SystemId, System>, components: Entities<ComponentId, Component>) {
    // 整合の確認
    // componentに対するsystemはあるか？
    components.forEach(v => {
      if(!systems.contains(v.systemId)) {
        console.error(v);
        throw new Error('systemIdに対応するsystemがありません');
      }
    })
    return new SystemsAndComponents(systems, components)
    
  }

  /**
   * コンポーネントをシステムに集約する
   */
  aggregateSystem(): SystemsAndComponents {
    const aggregatedComponents = new Entities<ComponentId, Component>(this.components.map(v => v.aggregateSystem()))
    return new SystemsAndComponents(this.systems, aggregatedComponents)
  }
  /**
   * バウンダリー以外のコンポーネントをシステムに集約する
   */
   aggregateSystemWithoutBoundary(): SystemsAndComponents {
    const aggregatedComponents = new Entities<ComponentId, Component>(this.components.map(v => v.isBoundary ? v : v.aggregateSystem()))
    return new SystemsAndComponents(this.systems, aggregatedComponents)
  }

  findSystemAndBoundary(): Entities<SystemIdOrComponentId, SystemOrComponent> {
    const list: SystemOrComponent[] = [];
    this.systems.map(v => SystemOrComponent.ofSystem(v)).forEach(v => list.push(v))
    this.components.filter(v => v.isBoundary).map(v => SystemOrComponent.ofComponent(v)).forEach(v => list.push(v))
    return new Entities<SystemIdOrComponentId, SystemOrComponent>(list)
  }

  findBoundaryComponentIdOrSystemId(systemIdOrComponentId: SystemIdOrComponentId): SystemIdOrComponentId {
    if(this.cache.contains(systemIdOrComponentId.stringValue)) {
      return systemIdOrComponentId;
    }
    const isSystem = this.systems.contains(new SystemId(systemIdOrComponentId.stringValue));
    if(isSystem) {
      return this.cache.put(systemIdOrComponentId.stringValue, systemIdOrComponentId)
    }

    const isComponent = this.components.contains(new ComponentId(systemIdOrComponentId.stringValue));
    if(!isComponent) {
      throw new Error('不明なID: ' + systemIdOrComponentId.stringValue)
    }
    
    const component = this.components.findById(new ComponentId(systemIdOrComponentId.stringValue))
    if(component.isBoundary) {
      return this.cache.put(systemIdOrComponentId.stringValue, systemIdOrComponentId)
    }
    const result = new SystemIdOrComponentId(component.systemId.stringValue);
    return this.cache.put(result.stringValue, result)
  }

  findComponentIdOrSystemId(systemIdOrComponentId: SystemIdOrComponentId): SystemIdOrComponentId {
    const isSystem = this.systems.contains(new SystemId(systemIdOrComponentId.stringValue));
    if(isSystem) {
      return systemIdOrComponentId;
    }
    const isComponent = this.components.contains(new ComponentId(systemIdOrComponentId.stringValue));
    if(!isComponent) {
      throw new Error('不明なID: ' + systemIdOrComponentId.stringValue)
    }
    const c = this.components.findById(new ComponentId(systemIdOrComponentId.stringValue))
    if(c.isSystemAggregated) {
      return new SystemIdOrComponentId(c.systemId.stringValue);
    }
    return systemIdOrComponentId;
  }

  findByComponentIdOrSystemId(systemIdOrComponentId: SystemIdOrComponentId): SystemOrComponent {
    const isSystem = this.systems.contains(new SystemId(systemIdOrComponentId.stringValue));
    if(isSystem) {
      return SystemOrComponent.ofSystem(this.systems.findById(new SystemId(systemIdOrComponentId.stringValue)))
    }
    const isComponent = this.components.contains(new ComponentId(systemIdOrComponentId.stringValue));
    if(!isComponent) {
      throw new Error('不明なID: ' + systemIdOrComponentId.stringValue)
    }
    return SystemOrComponent.ofComponent(this.components.findById(new ComponentId(systemIdOrComponentId.stringValue)))
  }

  findAll(): SystemOrComponent[] {
    return [
      ...this.systems.values.map(v => SystemOrComponent.ofSystem(v)),
      ...this.noneAggregateComponents.values.map(v => SystemOrComponent.ofComponent(v))
    ]
  }
}



