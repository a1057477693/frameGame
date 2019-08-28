import BehaviourComponent from "../Component/BehaviourComponent";

export enum ComponentType {
    Singleton = 1 << 0,
    Move = 1 << 1,
    Transfrom = 1 << 2,
    NetworkReceive = 1 << 3,
    Fire = 1 << 4,
    Collision = 1 << 5,
    Actor = 1 << 6,
    Camp = 1 << 7,
    Bullet = 1 << 8,
    AutoDestory = 1 << 9,
    Behaviour =1<<10,
}

export enum EntityType {
    Singleton, //单例实体
    Actor,
    Bullet,  //子弹
}

export enum SystemType {
    NetWork,
    Input,
    LogicBeforePhysics,
    Physics,
    LogicAfterPhysics,
    AfterLogicCycle,
    Backup,
    Render,
    AfterCycle,
    END,
}

export enum CycleType {
    RealTime,//时间驱动
    Network,//网络驱动
}
