import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/ECSConfig";
import NetworkReceiveComponent from "../Component/NetworkReceiveComponent";

/**
 *网络下发系统
 */
export default class NetworkReceiveSystem implements System {

    world: World;

    type: SystemType = SystemType.LogicBeforePhysics;

    onUpdate() {
        let nrc = this.world.getSingletonEntityComponent(NetworkReceiveComponent);

        nrc.msgThisLogic = null;
        let frameToDealThisMsg = Math.floor((this.world.logicCycleCount - 1) / this.world.netWorkUpdateInterval * this.world.fixedUpdateInterval) + 1;
        if (frameToDealThisMsg > nrc.dealIdx) {
            nrc.msgThisLogic = nrc.msgToDeal[nrc.dealIdx];
            nrc.dealIdx++;
        }


        //如果正在处理的包的idx 小于所有包的长度，说明有新包(这是之前的写法没有考虑网络延迟发包)
        // if (nrc.dealIdx < nrc.msgToDeal.length) {
        //     nrc.msgThisLogic = nrc.msgToDeal[nrc.dealIdx];
        //     nrc.dealIdx++;
        // } else {
        //     nrc.msgThisLogic = null;
        // }
    }
}