import {Entity} from "../ECS/Entity";
import {System} from "../ECS/System";
import AutoDestoryComponent from "../Component/AutoDestoryComponent";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/ECSConfig";
import ActorStatusComponent from "../Component/ActorStatusComponent";
import MoveComponent from "../Component/MoveComponent";
import FireComponent from "../Component/FireComponent";
import CollisionComponent from "../Component/CollisionComponent";

/**
 * 死亡系统
 */
export default class DieSystem implements System {

    world: World;

    type: SystemType = SystemType.LogicAfterPhysics;

    onUpdate() {
        this.world.forEach([ActorStatusComponent], (e: Entity, actorStatus: ActorStatusComponent) => {

                if (actorStatus.healtPoint <= 0 && !actorStatus.isDie) {
                    e.removeComponent(MoveComponent);
                    e.removeComponent(FireComponent);
                    e.removeComponent(CollisionComponent);

                    actorStatus.isDie = true;
                }
            }
        );
    }
}