import MoveComponent from "./Component/MoveComponent";
import {ComponentType, EntityType} from "./ECS/ECSConfig";
import {World} from "./ECS/World";
import MoveSystem from "./System/MoveSystem";
import TransfromComponent from "./Component/TransfromComponent";
import NetworkReceiveSystem from "./System/NetworkReceiveSystem";
import NetworkReceiveComponent from "./Component/NetworkReceiveComponent";
import FireComponent from "./Component/FireComponent";
import FireSystem from "./System/FireSystem";
import CollisionComponent from "./Component/CollisionComponent";
import CollisionDetectionSystem from "./System/CollisionDetectionSystem";
import ActorStatusComponent from "./Component/ActorStatusComponent";
import BulletComponent from "./Component/BulletComponent";
import CampComponent from "./Component/CampComponent";
import HitSystem from "./System/HitSystem";
import AutoDestoryComponent from "./Component/AutoDestoryComponent";
import AutoDestorySystem from "./System/AutoDestorySystem";
import DieSystem from "./System/DieSystem";
import AISystem from "./System/AISystem";
import BehaviourComponent from "./Component/BehaviourComponent";


export default class GameService {
    static initWorld() {
        MoveComponent.prototype.type = ComponentType.Move;
        TransfromComponent.prototype.type = ComponentType.Transfrom;
        NetworkReceiveComponent.prototype.type = ComponentType.NetworkReceive;
        FireComponent.prototype.type = ComponentType.Fire;
        CollisionComponent.prototype.type = ComponentType.Collision;
        ActorStatusComponent.prototype.type = ComponentType.Actor;
        BulletComponent.prototype.type = ComponentType.Bullet;
        CampComponent.prototype.type = ComponentType.Camp;
        AutoDestoryComponent.prototype.type = ComponentType.AutoDestory;
        BehaviourComponent.prototype.type = ComponentType.Behaviour;

        let world = World.getInstance();
        //world.fixedUpdateInterval = 1 / 60 * 1000;
        world.addSystemToCyle(new NetworkReceiveSystem());
        world.addSystemToCyle(new MoveSystem());
        world.addSystemToCyle(new FireSystem());
        world.addSystemToCyle(new CollisionDetectionSystem());
        world.addSystemToCyle(new HitSystem());
        world.addSystemToCyle(new AutoDestorySystem());
        world.addSystemToCyle(new DieSystem());
        //AI系统
        world.addSystemToCyle(new AISystem());
    }

    static logicCycleThisCycle(): number {
        let word = World.getInstance();
        let nrc = word.getSingletonEntityComponent(NetworkReceiveComponent);

        //计算当前网络包支持的最大帧数maxLCByNet
        let n2l = word.netWorkUpdateInterval / word.fixedUpdateInterval;
        let maxLCByNet = Math.ceil(nrc.msgToDeal.length * n2l);

        //计算根据流失的时间支持的最大帧数maxLCByTime
        let timePass = new Date().getTime() - nrc.startTime;
        let maxLCByTime = Math.floor(timePass / word.fixedUpdateInterval) + 1;

        let LCThisCycle = Math.min(maxLCByNet, maxLCByTime) - word.logicCycleCount;

        // console.log("可以执行几个逻辑帧：", LCThisCycle, "最大的时间值：", maxLCByTime, "最大的网络值：", maxLCByNet);
        return LCThisCycle;
    }

}