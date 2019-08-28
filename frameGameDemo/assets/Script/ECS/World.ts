/**
 * ECS的入口
 */
import Component from "./Component";
import {Entity} from "./Entity";
import {convertComponentTypeIdToIndex, getCompontsProtoBits, isContainSubBit} from "./Utils";
import {System} from "./System";
import {CycleType, EntityType, SystemType} from "./ECSConfig";
import NetworkReceiveComponent from "../Component/NetworkReceiveComponent";

export class World {
    private static _instance: World = null;

    static getInstance(): World {
        if (!World._instance) {
            World._instance = new World();
        }
        return World._instance;
    }

    cycleType: CycleType = CycleType.Network;
    netWorkLogicFn: () => number;

    private allEntitys: Entity[] = [];
    private entityByForEach: Map<number, Set<Entity>> = new Map<number, Set<Entity>>();
    useEntityId: number = 0;
    private systemInCyle: System[][] = [];
    newEntitiesInThisCyle: Entity[] = [];  //这一帧新创建的Entity;
    private entitesDestoryedForeachInThisCyle: Entity[] = [];//所有要销毁的Entity
    private entitesDestoryedInThisCyle: Entity[] = []; //这一帧最终销毁的Entity

    private entitiesCommponentsDirtyInThisCyle: Entity[] = [];//存放标记脏的Entity

    singletonEntity: Entity = null;

    lastLogicRemainTime: number = 0; //上一个逻辑的剩余时间
    lastFrameUTC: number = 0;//上一帧的时间

    fixedUpdateInterval: number = 0;//每一逻辑帧的时间间隔

    netWorkUpdateInterval: number = 0;//每一个网络帧的时间间隔

    framDt: number = 0;//渲染的时间间隔

    logicCycleCount: number = 0;//逻辑循环次数

    cycleCount: number = 0;//大循环次数

    worldInCyle: boolean = false;//标记系统在不在循环中

    uiLerpValue: number = 0;//UI插值

    forEach(types: { prototype: Component }[], fn: (entity: Entity, ...components: Component[]) => void): void {
        let bits = getCompontsProtoBits(types);

        let entitys = this.entityByForEach.get(bits);

        if (!entitys) {
            entitys = this.onRegistNewForeach(bits);
        }

        let positions: number[] = [];

        for (let i = 0; i < types.length; i++) {

            let type = types[i];
            positions.push(convertComponentTypeIdToIndex(type.prototype.type));
        }

        entitys.forEach(function (e: Entity) {
            fn(e, ...e.getCompontsByIndex(positions));
        });

    }

    private onRegistNewForeach(bits: number): Set<Entity> {

        let entitys = new Set<Entity>();

        for (let i = 0; i < this.allEntitys.length; i++) {

            let entity = this.allEntitys[i];
            if (entity && entity.hasComponentBits(bits)) {
                entitys.add(entity);
            }

        }
        this.entityByForEach.set(bits, entitys);
        return entitys;

    }

    addEntityToWorld(entity: Entity): void {
        this.useEntityId++;
        entity.id = this.useEntityId;
        //这里最好执行下备份函数
        entity.backupComponents();
        this.allEntitys.push(entity);
        this.newEntitiesInThisCyle.push(entity);

    }

    getNewEntity(entityType: EntityType): Entity {
        let entity = new Entity()
        entity.type = entityType;
        return entity;
    }

    /**
     * 根据Entity的Id取Entity
     * @param {number} entityId
     * @returns {Entity}
     */
    getEntityByEntityId(entityId: number): Entity {
        //这里-1是因为addEntityToWorld函数中索引先++了
        return this.allEntitys[entityId - 1];
    }

    /**
     * 根据含有的Componts来去除Entitys
     * @param {{prototype: Component}[]} type
     * @returns {Set<Entity>}
     */
    getEntityByComponents(type: { prototype: Component }[]): Set<Entity> {
        let bits = getCompontsProtoBits(type);
        let entites = this.entityByForEach.get(bits);
        if (!entites) {
            entites = this.onRegistNewForeach(bits);
        }
        return entites;
    }

    /**
     * 启动Cyle
     */
    startCyle() {
        this.lastFrameUTC = new Date().getTime();
        this.worldInCyle = true;
        this.cycleCount = 0;
        this.logicCycleCount = 0;
    }

    /**
     * 获取单例实体
     * @returns {Entity}
     */
    getSingletonEntity(): Entity {
        if (!this.singletonEntity) {
            this.singletonEntity = this.getNewEntity(EntityType.Singleton);
            this.addEntityToWorld(this.singletonEntity);
        }
        return this.singletonEntity;
    }

    /**
     * 获取单例实体的Component
     * @returns {Entity}
     */
    getSingletonEntityComponent<T extends Component>(type: { prototype: T, new(): T }): T {

        let entity = this.getSingletonEntity();
        if (!entity.hasComponent<T>(type)) {
            entity.addCompont<T>(type);
        }
        return entity.getCompont<T>(type);
    }

    addSystemToCyle(system: System): void {
        system.world = this;

        if (!this.systemInCyle[system.type]) {
            this.systemInCyle[system.type] = [];
        }
        this.systemInCyle[system.type].push(system);
    }

    cycle(): void {
        if (this.cycleType == CycleType.Network) {
            this.cycleWithNetWork();
        } else if (this.cycleType == CycleType.RealTime) {
            this.cycleWithRealTime();
        }

    }

    cycleWithRealTime(): void {
        let currentUTC = new Date().getTime();

        let framTotalTime = this.getThisFrameTime(currentUTC);
        // 需要执行的逻辑帧次数
        let logicUpdateCount = Math.floor(framTotalTime / this.fixedUpdateInterval);

        //渲染的时间间隔
        this.framDt = currentUTC - this.lastFrameUTC;
        this.lastFrameUTC = currentUTC;
        this.lastLogicRemainTime = framTotalTime - (logicUpdateCount * this.fixedUpdateInterval);

        for (let i = SystemType.NetWork; i < SystemType.LogicBeforePhysics; i++) {
            let systems = this.systemInCyle[i];
            if (!systems) {
                continue;
            }
            for (let j = 0; j < systems.length; j++) {
                let system = systems[j];
                system.onUpdate();
                //每次update，都去更新下Entitis的数据
                this.updateEntitiesByForEach();
            }
        }

        for (let i = 0; i < logicUpdateCount; i++) {
            for (let j = SystemType.LogicBeforePhysics; j < SystemType.Render; j++) {
                let systems = this.systemInCyle[j];
                if (!systems) {
                    continue;
                }
                for (let k = 0; k < systems.length; k++) {
                    let system = systems[k];
                    system.onUpdate();
                    //每次update，都去更新下Entitis的数据
                    this.updateEntitiesByForEach();
                }
            }
        }

        for (let i = SystemType.Render; i < SystemType.END; i++) {
            let systems = this.systemInCyle[i];
            if (!systems) {
                continue;
            }
            for (let j = 0; j < systems.length; j++) {
                let system = systems[j];
                system.onUpdate();
                //每次update，都去更新下Entitis的数据
                this.updateEntitiesByForEach();
            }
        }
        this.updateNewEntitiesByForEach();
        //逻辑循环次数，大循环的次数
        this.logicCycleCount += logicUpdateCount;
        this.cycleCount++;
    }

    cycleWithNetWork(): void {
        let currentUTC = new Date().getTime();

        let framTotalTime = this.getThisFrameTime(currentUTC);
        // 需要执行的逻辑帧次数
        let logicUpdateCount = this.netWorkLogicFn();

        //渲染的时间间隔
        this.framDt = currentUTC - this.lastFrameUTC;
        this.lastFrameUTC = currentUTC;
        this.lastLogicRemainTime = framTotalTime - (logicUpdateCount * this.fixedUpdateInterval);

        for (let i = SystemType.NetWork; i < SystemType.LogicBeforePhysics; i++) {
            let systems = this.systemInCyle[i];
            if (!systems) {
                continue;
            }
            for (let j = 0; j < systems.length; j++) {
                let system = systems[j];
                system.onUpdate();
                //每次update，都去更新下Entitis的数据
                this.updateEntitiesByForEach();
                //每次update ，都去判断是否有被标记销毁的Entity
                this.removeDestoryEntityByForEach();
            }
        }

        for (let i = 0; i < logicUpdateCount; i++) {
            //逻辑循环次数
            this.logicCycleCount++;
            this.backUpEntityComponents();
            for (let j = SystemType.LogicBeforePhysics; j < SystemType.Render; j++) {
                let systems = this.systemInCyle[j];
                if (!systems) {
                    continue;
                }
                for (let k = 0; k < systems.length; k++) {
                    let system = systems[k];
                    system.onUpdate();
                    //每次update，都去更新下Entitis的数据
                    this.updateEntitiesByForEach();
                    //每次update ，都去判断是否有被标记销毁的Entity
                    this.removeDestoryEntityByForEach();
                }
            }
        }


        let lastFramTime = this.getSingletonEntityComponent(NetworkReceiveComponent).startTime + (this.logicCycleCount - 1) * this.fixedUpdateInterval;
        this.updateUILerpValue(lastFramTime);

        if (this.logicCycleCount >= 1) {
            for (let i = SystemType.Render; i < SystemType.END; i++) {
                let systems = this.systemInCyle[i];
                if (!systems) {
                    continue;
                }
                for (let j = 0; j < systems.length; j++) {
                    let system = systems[j];
                    system.onUpdate();
                    //每次update，都去更新下Entitis的数据
                    this.updateEntitiesByForEach();
                    //每次update ，都去判断是否有被标记销毁的Entity
                    this.removeDestoryEntityByForEach();
                }
            }
            this.updateNewEntitiesByForEach();
        }

        //一次大循环结束，也就是一帧结束清空销毁的Entity
        this.removeDestoryEntites();
        //大循环的次数
        this.cycleCount++;
    }

    /**
     * 更新UI插值
     * @param {number} lastTime
     */
    updateUILerpValue(lastTime: number) {
        let time = new Date().getTime();
        let value = (time - lastTime) / this.fixedUpdateInterval;

        this.uiLerpValue = Math.min(value, 2);
    }

    regisNetWorkLogicCycle(fn: () => number) {
        this.netWorkLogicFn = fn;
    }

    /**
     *获取这一帧需要处理的时间差
     */
    getThisFrameTime(currentTime: number): number {
        return this.lastLogicRemainTime + currentTime - this.lastFrameUTC;
    }

    updateEntitiesByForEach() {

        for (let i = 0; i < this.entitiesCommponentsDirtyInThisCyle.length; i++) {

            let entity = this.entitiesCommponentsDirtyInThisCyle[i];
            let oldBits = entity.oldBits;
            let newBits = entity.compontBits;


            this.entityByForEach.forEach((set: Set<Entity>, systemBits: number, map: Map<number, Set<Entity>>) => {
                let containOldBits = isContainSubBit(systemBits, oldBits);
                let containNewBits = isContainSubBit(systemBits, newBits);

                //保证set永远是最新的
                if (containOldBits && !containNewBits) {
                    set.delete(entity);
                } else if (!containOldBits && containNewBits) {
                    set.add(entity);
                }
            });
            entity.cancleDirty();
        }
        this.entitiesCommponentsDirtyInThisCyle.length = 0;
    }

    updateNewEntitiesByForEach() {
        for (let i = 0; i < this.newEntitiesInThisCyle.length; i++) {

            let entity = this.newEntitiesInThisCyle[i];
            let newBits = entity.compontBits;

            this.entityByForEach.forEach((set: Set<Entity>, systemBits: number, map: Map<number, Set<Entity>>) => {
                let containNewBits = isContainSubBit(systemBits, newBits);

                //保证set永远是最新的
                if (containNewBits) {
                    set.add(entity);
                }
            });
        }
        this.newEntitiesInThisCyle.length = 0;

    }

    notifyEntityComponentsDirty(entity: Entity) {
        this.entitiesCommponentsDirtyInThisCyle.push(entity);
    }

    /**
     * 备份所有Entity的Component
     */
    backUpEntityComponents() {
        for (let i = 0; i < this.allEntitys.length; i++) {
            let entity = this.allEntitys[i];
            if(entity){
                entity.backupComponents();
            }
        }
    }

    /**
     * 告诉World 这个entity销毁了
     * @param {Entity} entity
     */
    notifyEntityDestoryed(entity: Entity) {
        this.entitesDestoryedForeachInThisCyle.push(entity);
    }

    /**
     * 从ForEach中拿出要销毁的Entity放到this.entitesDestoryedInThisCyle
     */
    removeDestoryEntityByForEach() {
        for (let i = 0; i < this.entitesDestoryedForeachInThisCyle.length; i++) {
            let entity = this.entitesDestoryedForeachInThisCyle[i];
            let oldBits = entity.oldBits;
            let newBits = entity.compontBits;

            this.entityByForEach.forEach((set: Set<Entity>, systemBits: number) => {
                let containOldBits = isContainSubBit(systemBits, oldBits);
                let containNewBits = isContainSubBit(systemBits, newBits);

                //判断是否有被标记销毁
                if (containNewBits || containOldBits) {
                    //有被标记销毁，从Set集合中删除
                    set.delete(entity);
                }
            });
            this.entitesDestoryedInThisCyle.push(entity);
        }
        this.entitesDestoryedForeachInThisCyle.length = 0;
    }

    /**
     * 这里销毁最终要销毁的Entity
     */
    removeDestoryEntites() {
        for (let i = 0; i < this.entitesDestoryedInThisCyle.length; i++) {
            let entity = this.entitesDestoryedInThisCyle[i];
            this.allEntitys[entity.id] = null;
        }
        this.entitesDestoryedInThisCyle.length = 0;
    }


}