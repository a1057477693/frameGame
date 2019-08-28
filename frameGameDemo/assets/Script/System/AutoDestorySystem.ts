import {Entity} from "../ECS/Entity";
import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/ECSConfig";
import AutoDestoryComponent from "../Component/AutoDestoryComponent";

/**
 * 自动销毁控制系统
 */
export default class AutoDestorySystem implements System {

    world: World;

    type: SystemType = SystemType.LogicAfterPhysics;

    onUpdate() {
        this.world.forEach([AutoDestoryComponent], (e: Entity, autoDestory: AutoDestoryComponent) => {
                autoDestory.lifeTime++;
                if (autoDestory.lifeTime >= autoDestory.maxLifeTime) {
                    console.log("Auto Destory");
                    e.maskDestoyed();
                }
            }
        );
    }
}