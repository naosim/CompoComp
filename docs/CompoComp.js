class Cache1 {
    map = {
    };
    put(key, value) {
        this.map[key] = value;
        return value;
    }
    contains(key) {
        return !!this.map[key];
    }
    get(key) {
        return this.map[key];
    }
}
function toMap(ary) {
    return ary.reduce((memo, v)=>{
        memo[v] = true;
        return memo;
    }, {
    });
}
class Bundle {
    map = {
    };
    put(key, value) {
        if (!this.map[key]) {
            this.map[key] = [];
        }
        this.map[key].push(value);
        return this;
    }
    contains(key) {
        return !!this.map[key];
    }
    get(key) {
        return this.map[key];
    }
    forEach(cb) {
        Object.keys(this.map).forEach((k)=>cb(k, this.map[k])
        );
    }
}
function mapkv(obj, cb) {
    return Object.keys(obj).reduce((memo, k)=>{
        memo[k] = cb(k, obj[k]);
        return memo;
    }, {
    });
}
class Entities {
    list;
    entityMap;
    constructor(list){
        this.list = list;
        this.entityMap = list.reduce((memo, v)=>{
            memo[v.id.stringValue] = v;
            return memo;
        }, {
        });
    }
    get values() {
        return [
            ...this.list
        ];
    }
    findById(id) {
        const result = this.entityMap[id.stringValue];
        if (!id) {
            throw new Error('存在しない: ' + id);
        }
        return result;
    }
    filter(predicate) {
        return new Entities(this.list.filter(predicate));
    }
    map(callbackfn) {
        return this.list.map(callbackfn);
    }
    reduce(callbackfn, initialValue) {
        return this.list.reduce(callbackfn, initialValue);
    }
    forEach(callbackfn) {
        this.list.forEach(callbackfn);
    }
    contains(id) {
        return this.entityMap[id.stringValue] !== undefined;
    }
}
class SystemId {
    value;
    stringValue;
    _SystemId;
    constructor(value1){
        this.value = value1;
        this.stringValue = value1;
    }
}
class ComponentId {
    value;
    stringValue;
    _ComponentId;
    constructor(value2){
        this.value = value2;
        this.stringValue = value2;
    }
}
class SystemIdOrComponentId {
    value;
    stringValue;
    _SystemIdOrComponentId;
    constructor(value3){
        this.value = value3;
        this.stringValue = value3;
    }
}
class System {
    id;
    name;
    childCount;
    obj;
    isBoundary;
    actorType;
    place;
    hasChild;
    constructor(id1, name1, childCount1, obj1){
        this.id = id1;
        this.name = name1;
        this.childCount = childCount1;
        this.obj = obj1;
        this.isBoundary = obj1.actorType !== undefined && obj1.actorType == 'boundary';
        this.actorType = obj1.actorType;
        this.place = obj1.place;
        this.hasChild = childCount1 > 0;
    }
    static isSameType(obj) {
        return obj.type == 'system';
    }
    static create(obj, childCount) {
        if (!System.isSameType(obj)) {
            throw new Error('typeが違う');
        }
        if (obj.systemId) {
            throw new Error('systemにsystemIdがあってはならない');
        }
        return new System(new SystemId(obj.id), obj.name || obj.id, childCount, obj);
    }
}
class Component {
    id;
    name;
    systemId;
    isSystemAggregated;
    obj;
    isBoundary;
    actorType;
    place;
    constructor(id2, name2, systemId1, isSystemAggregated, obj2){
        this.id = id2;
        this.name = name2;
        this.systemId = systemId1;
        this.isSystemAggregated = isSystemAggregated;
        this.obj = obj2;
        this.isBoundary = obj2.actorType !== undefined && obj2.actorType == 'boundary';
        this.actorType = obj2.actorType;
        this.place = obj2.place;
    }
    aggregateSystem() {
        return new Component(this.id, this.name, this.systemId, true, this.obj);
    }
    static isSameType(obj) {
        return obj.type == 'component';
    }
    static create(obj) {
        if (!Component.isSameType(obj)) {
            throw new Error('typeが違う');
        }
        if (!obj.systemId) {
            throw new Error('componentにsystemIdがない');
        }
        return new Component(new ComponentId(obj.id), obj.name || obj.id, new SystemId(obj.systemId), false, obj);
    }
}
class SystemOrComponent {
    system;
    component;
    id;
    value;
    name;
    actorType;
    place;
    systemId;
    isSystem;
    isComponent;
    constructor(system1, component1){
        this.system = system1;
        this.component = component1;
        this.value = system1 || component1;
        this.id = new SystemIdOrComponentId(this.value.id.stringValue);
        this.name = this.value.name;
        this.actorType = this.value.actorType;
        this.isSystem = !!system1;
        this.isComponent = !!component1;
        if (this.isComponent) {
            this.place = component1.place;
            this.systemId = component1.systemId;
        }
    }
    isSingleSystem() {
        return this.isSystem && this.system.childCount == 0;
    }
    static ofSystem(system) {
        return new SystemOrComponent(system);
    }
    static ofComponent(component) {
        return new SystemOrComponent(undefined, component);
    }
}
class SystemsAndComponents {
    systems;
    components;
    cache = new Cache1();
    noneAggregateComponents;
    constructor(systems1, components1){
        this.systems = systems1;
        this.components = components1;
        this.noneAggregateComponents = components1.filter((v)=>!v.isSystemAggregated
        );
    }
    static create(systems, components) {
        components.forEach((v)=>{
            if (!systems.contains(v.systemId)) {
                console.error(v);
                throw new Error('systemIdに対応するsystemがありません');
            }
        });
        return new SystemsAndComponents(systems, components);
    }
    aggregateSystem() {
        const aggregatedComponents = new Entities(this.components.map((v)=>v.aggregateSystem()
        ));
        return new SystemsAndComponents(this.systems, aggregatedComponents);
    }
    aggregateSystemWithoutBoundary() {
        const aggregatedComponents = new Entities(this.components.map((v)=>v.isBoundary ? v : v.aggregateSystem()
        ));
        return new SystemsAndComponents(this.systems, aggregatedComponents);
    }
    findSystemAndBoundary() {
        const list1 = [];
        this.systems.map((v)=>SystemOrComponent.ofSystem(v)
        ).forEach((v)=>list1.push(v)
        );
        this.components.filter((v)=>v.isBoundary
        ).map((v)=>SystemOrComponent.ofComponent(v)
        ).forEach((v)=>list1.push(v)
        );
        return new Entities(list1);
    }
    findBoundaryComponentIdOrSystemId(systemIdOrComponentId) {
        if (this.cache.contains(systemIdOrComponentId.stringValue)) {
            return systemIdOrComponentId;
        }
        const isSystem = this.systems.contains(new SystemId(systemIdOrComponentId.stringValue));
        if (isSystem) {
            return this.cache.put(systemIdOrComponentId.stringValue, systemIdOrComponentId);
        }
        const isComponent = this.components.contains(new ComponentId(systemIdOrComponentId.stringValue));
        if (!isComponent) {
            throw new Error('不明なID: ' + systemIdOrComponentId.stringValue);
        }
        const component2 = this.components.findById(new ComponentId(systemIdOrComponentId.stringValue));
        if (component2.isBoundary) {
            return this.cache.put(systemIdOrComponentId.stringValue, systemIdOrComponentId);
        }
        const result = new SystemIdOrComponentId(component2.systemId.stringValue);
        return this.cache.put(result.stringValue, result);
    }
    findComponentIdOrSystemId(systemIdOrComponentId) {
        const isSystem = this.systems.contains(new SystemId(systemIdOrComponentId.stringValue));
        if (isSystem) {
            return systemIdOrComponentId;
        }
        const isComponent = this.components.contains(new ComponentId(systemIdOrComponentId.stringValue));
        if (!isComponent) {
            throw new Error('不明なID: ' + systemIdOrComponentId.stringValue);
        }
        const c = this.components.findById(new ComponentId(systemIdOrComponentId.stringValue));
        if (c.isSystemAggregated) {
            return new SystemIdOrComponentId(c.systemId.stringValue);
        }
        return systemIdOrComponentId;
    }
    findByComponentIdOrSystemId(systemIdOrComponentId) {
        const isSystem = this.systems.contains(new SystemId(systemIdOrComponentId.stringValue));
        if (isSystem) {
            return SystemOrComponent.ofSystem(this.systems.findById(new SystemId(systemIdOrComponentId.stringValue)));
        }
        const isComponent = this.components.contains(new ComponentId(systemIdOrComponentId.stringValue));
        if (!isComponent) {
            throw new Error('不明なID: ' + systemIdOrComponentId.stringValue);
        }
        return SystemOrComponent.ofComponent(this.components.findById(new ComponentId(systemIdOrComponentId.stringValue)));
    }
    findAll() {
        return [
            ...this.systems.values.map((v)=>SystemOrComponent.ofSystem(v)
            ),
            ...this.noneAggregateComponents.values.map((v)=>SystemOrComponent.ofComponent(v)
            )
        ];
    }
}
class BucId {
    value;
    stringValue;
    constructor(value4){
        this.value = value4;
        this.stringValue = value4;
    }
}
class SystemDependence {
    currentSystemId;
    targetSystemId;
    usecaseName;
    constructor(currentSystemId, targetSystemId, usecaseName){
        this.currentSystemId = currentSystemId;
        this.targetSystemId = targetSystemId;
        this.usecaseName = usecaseName;
    }
}
class SucId {
    value;
    stringValue;
    constructor(value5){
        this.value = value5;
        this.stringValue = value5;
    }
}
class Buc {
    id;
    obj;
    name;
    constructor(id3, obj3){
        this.id = id3;
        this.obj = obj3;
        this.name = obj3.name;
    }
    static isSameType(obj) {
        return obj.type == 'buc';
    }
    static create(obj) {
        if (!Buc.isSameType(obj)) {
            throw new Error('typeが違う');
        }
        return new Buc(new BucId(obj.id), obj);
    }
}
class Suc {
    id;
    dependences;
    obj;
    name;
    bucMap;
    constructor(id4, dependences, obj4){
        this.id = id4;
        this.dependences = dependences;
        this.obj = obj4;
        this.name = obj4.name;
        this.bucMap = toMap(obj4.buc);
    }
    containsBucs(bucIds) {
        return bucIds.filter((v)=>this.bucMap[v.stringValue]
        ).length > 0;
    }
    static isSameType(obj) {
        return obj.type == 'suc';
    }
    static create(obj, usecaseMap) {
        if (!Suc.isSameType(obj)) {
            throw new Error('typeが違う');
        }
        if (!obj.dependences) {
            obj.dependences = [];
        }
        const deps = obj.dependences.map((v)=>{
            var dep;
            if (typeof v == 'string') {
                if (!usecaseMap[v]) {
                    throw new Error('未定義のユースケース: ' + v);
                }
                const summary = usecaseMap[v];
                dep = {
                    systemId: summary.systemId,
                    uc: summary.name
                };
            } else {
                dep = v;
            }
            return new SystemDependence(new SystemIdOrComponentId(obj.systemId), new SystemIdOrComponentId(dep.systemId), dep.uc);
        });
        return new Suc(new SucId(obj.id), deps, obj);
    }
}
var AggregateType;
(function(AggregateType1) {
    AggregateType1["none"] = "none";
    AggregateType1["aggregate"] = "aggregate";
    AggregateType1["aggregateWithoutBoundary"] = "aggregateWithoutBoundary";
})(AggregateType || (AggregateType = {
}));
class PlanUmlConverter {
    convert(models, options) {
        options = options || {
        };
        const aggregateType = options.aggregateType || AggregateType.none;
        const displayUsecaseName = options.displayUsecaseName === false ? false : true;
        const title = options.title || '';
        var systemsAndComponents = models.systemsAndComponents;
        const bucs = models.bucs;
        const sucs = models.sucs;
        if (aggregateType == AggregateType.aggregate) {
            systemsAndComponents = systemsAndComponents.aggregateSystem();
        } else if (aggregateType == AggregateType.aggregateWithoutBoundary) {
            systemsAndComponents = systemsAndComponents.aggregateSystemWithoutBoundary();
        }
        var plantuml = [
            '@startuml ' + title
        ];
        if (aggregateType == AggregateType.none) {
            systemsAndComponents.findAll().filter((v)=>v.isComponent || v.isSingleSystem()
            ).forEach((v)=>plantuml.push(toPlantUml(v, models.componentStyles))
            );
        } else {
            systemsAndComponents.findAll().forEach((v)=>plantuml.push(toPlantUml(v, models.componentStyles))
            );
        }
        const depsMap = {
        };
        sucs.forEach((v)=>{
            v.dependences.forEach((d)=>{
                const left = systemsAndComponents.findComponentIdOrSystemId(d.currentSystemId);
                const right = systemsAndComponents.findComponentIdOrSystemId(d.targetSystemId);
                if (left.stringValue == right.stringValue) {
                    return;
                }
                if (!depsMap[`${left.stringValue} --> ${right.stringValue}`]) {
                    depsMap[`${left.stringValue} --> ${right.stringValue}`] = [];
                }
                depsMap[`${left.stringValue} --> ${right.stringValue}`].push(d.usecaseName);
            });
        });
        Object.keys(depsMap).forEach((key)=>{
            const usecaseName1 = displayUsecaseName ? `: ${depsMap[key].join(',\\n')}` : '';
            plantuml.push(`${key}${usecaseName1}`);
        });
        plantuml.push('@enduml');
        return plantuml.join('\n');
    }
}
function convertStyle(style) {
    return '#' + style.map((k, v)=>{
        if (k == 'fill') {
            return v.value;
        }
        if (k == 'stroke') {
            return `line:${v.value}`;
        }
        return null;
    }).filter((v)=>v
    ).join(';');
}
function toPlantUml(v, componentStyles) {
    var objType = 'rectangle';
    if (v.actorType && v.actorType != 'system') {
        objType = v.actorType;
    }
    const hasStyle = v.isComponent && componentStyles.contains(new ComponentId(v.id.stringValue));
    const style = hasStyle ? convertStyle(componentStyles.findByComponentId(new ComponentId(v.id.stringValue)).style) : '';
    const stereotype = v.isComponent ? `<<${v.systemId.stringValue}>>` : '';
    if (!v.place) {
        return `${objType} "${v.name}" ${stereotype} as ${v.id.value} ${style}`;
    }
    return `
frame ${v.place} {
  ${objType} "${v.name}" ${stereotype} as ${v.id.value} ${style}
}
  `.trim();
}
class ComponentStyle {
    componentId;
    style;
    constructor(componentId1, style){
        this.componentId = componentId1;
        this.style = style;
    }
    static create(obj) {
        return new ComponentStyle(new ComponentId(obj.componentId), new Style(mapkv(obj.style, (k, v)=>new Color(v)
        )));
    }
}
class Style {
    value;
    constructor(value6){
        this.value = value6;
    }
    map(cb) {
        return Object.keys(this.value).map((k)=>cb(k, this.value[k])
        );
    }
}
class Color {
    value;
    constructor(value7){
        this.value = value7;
    }
}
class ComponentStyles {
    values;
    valuesMap;
    constructor(values){
        this.values = values;
        this.valuesMap = values.reduce((memo, v)=>{
            memo[v.componentId.stringValue] = v;
            return memo;
        }, {
        });
    }
    forEach(cb) {
        this.values.forEach(cb);
    }
    findByComponentId(componentId) {
        return this.valuesMap[componentId.stringValue];
    }
    contains(componentId) {
        return !!this.valuesMap[componentId.stringValue];
    }
}
class Models {
    systemsAndComponents;
    bucs;
    sucs;
    componentStyles;
    constructor(systemsAndComponents, bucs, sucs, componentStyles){
        this.systemsAndComponents = systemsAndComponents;
        this.bucs = bucs;
        this.sucs = sucs;
        this.componentStyles = componentStyles;
    }
    filter(bucFilter) {
        return new Models(this.systemsAndComponents, this.bucs, this.sucs.filter((v)=>v.containsBucs(bucFilter)
        ), this.componentStyles);
    }
}
function createModels(systemYamlObjects, usecaseYamlObjects, componentStyleYamlObjects) {
    const components2 = new Entities(systemYamlObjects.filter((v)=>Component.isSameType(v)
    ).map((v)=>Component.create(v)
    ));
    const childCountMap = components2.reduce((memo, v)=>{
        const key = v.systemId.stringValue;
        if (!memo[key]) {
            memo[key] = 0;
        }
        memo[key]++;
        return memo;
    }, {
    });
    const systemsAndComponents1 = SystemsAndComponents.create(new Entities(systemYamlObjects.filter((v)=>System.isSameType(v)
    ).map((v)=>System.create(v, childCountMap[v.id] || 0)
    )), components2);
    const bucs1 = new Entities(usecaseYamlObjects.filter((v)=>Buc.isSameType(v)
    ).map((v)=>Buc.create(v)
    ));
    const usecaseMap = usecaseYamlObjects.filter((v)=>Suc.isSameType(v)
    ).map((v)=>v
    ).reduce((memo, v)=>{
        memo[v.id] = v;
        return memo;
    }, {
    });
    const sucs1 = new Entities(usecaseYamlObjects.filter((v)=>Suc.isSameType(v)
    ).map((v)=>Suc.create(v, usecaseMap)
    ));
    const componentStyles1 = new ComponentStyles(componentStyleYamlObjects.map((v)=>ComponentStyle.create(v)
    ));
    return new Models(systemsAndComponents1, bucs1, sucs1, componentStyles1);
}
class MermaidConverter {
    convert(models, options) {
        options = options || {
        };
        const aggregateType = options.aggregateType || AggregateType.none;
        const displayUsecaseName = options.displayUsecaseName === false ? false : true;
        const title = options.title || '';
        var systemsAndComponents1 = models.systemsAndComponents;
        const bucs1 = models.bucs;
        const sucs1 = models.sucs;
        if (aggregateType == AggregateType.aggregate) {
            systemsAndComponents1 = systemsAndComponents1.aggregateSystem();
        } else if (aggregateType == AggregateType.aggregateWithoutBoundary) {
            systemsAndComponents1 = systemsAndComponents1.aggregateSystemWithoutBoundary();
        }
        var mermaid = [
            'graph TD'
        ];
        const placeBundle = new Bundle();
        const nonePlace = '$$noneplace';
        var systemAndComponents = systemsAndComponents1.findAll();
        if (aggregateType == AggregateType.none) {
            systemAndComponents = systemAndComponents.filter((v)=>v.isComponent || v.isSingleSystem()
            );
        }
        systemAndComponents.forEach((v)=>placeBundle.put(v.place || '$$noneplace', v)
        );
        placeBundle.forEach((p, list1)=>{
            if (p != nonePlace) {
                mermaid.push(`  subgraph ${p}`);
            }
            list1.forEach((v)=>mermaid.push('  ' + toMermaid(v))
            );
            if (p != nonePlace) {
                mermaid.push(`  end`);
            }
        });
        models.componentStyles.forEach((v)=>{
            const style1 = v.style.map((k, v1)=>`${k}:#${v1.value}`
            ).join(',');
            mermaid.push(`  style ${v.componentId.value} ${style1}`);
        });
        const depsBundle = new Bundle();
        sucs1.forEach((v)=>{
            v.dependences.forEach((d)=>{
                const left = systemsAndComponents1.findComponentIdOrSystemId(d.currentSystemId).stringValue;
                const right = systemsAndComponents1.findComponentIdOrSystemId(d.targetSystemId).stringValue;
                const usecaseName1 = d.usecaseName;
                if (left == right) {
                    return;
                }
                depsBundle.put(`${left} --> ${right}`, {
                    left,
                    right,
                    usecaseName: usecaseName1
                });
            });
        });
        depsBundle.forEach((k, v)=>{
            const usecaseName1 = displayUsecaseName ? `|${v.map((v1)=>v1.usecaseName
            ).join(',<br>')}|` : '';
            mermaid.push(`  ${v[0].left} -->${usecaseName1} ${v[0].right}`);
        });
        return mermaid.join('\n');
    }
}
function toMermaid(v) {
    var kakko = [
        '(',
        ')'
    ];
    if (v.actorType) {
        if (v.actorType == 'boundary') {
            kakko = [
                '[\\',
                '/]'
            ];
        } else if (v.actorType == 'actor') {
            kakko = [
                '{{',
                '}}'
            ];
        }
    }
    const stereoType = v.isComponent ? `${v.systemId.stringValue}<br>` : '';
    return `${v.id.stringValue}${kakko[0]}"${stereoType}${v.name}"${kakko[1]}`;
}
var CompoComp1;
(function(CompoComp1) {
    function createModels1(list1) {
        return createModels(list1.filter((v)=>v.type == 'system' || v.type == 'component'
        ).map((v)=>v
        ), list1.filter((v)=>v.type == 'buc' || v.type == 'suc'
        ).map((v)=>v
        ), list1.filter((v)=>v.type == 'componentStyle'
        ).map((v)=>v
        ));
    }
    CompoComp1.createModels = createModels1;
    function filterModels(models, bucFilter) {
        return models.filter(bucFilter.map((v)=>new BucId(v)
        ));
    }
    CompoComp1.filterModels = filterModels;
    function toPlantUml1(models, options) {
        return toView(models, new PlanUmlConverter(), options);
    }
    CompoComp1.toPlantUml = toPlantUml1;
    function toMermaid1(models, options) {
        return toView(models, new MermaidConverter(), options);
    }
    CompoComp1.toMermaid = toMermaid1;
    function toView(models, convertor, options) {
        options = options || {
        };
        if (options.bucFilter) {
            models = models.filter(options.bucFilter.map((v)=>new BucId(v)
            ));
        }
        return convertor.convert(models, {
            title: options.title,
            aggregateType: options.aggregateType ? options.aggregateType : AggregateType.none,
            displayUsecaseName: options.displayUsecaseName
        });
    }
    CompoComp1.toView = toView;
})(CompoComp1 || (CompoComp1 = {
}));
export { CompoComp1 as CompoComp };
