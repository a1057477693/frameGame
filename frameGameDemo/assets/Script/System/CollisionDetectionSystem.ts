import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/ECSConfig";
import TransfromComponent from "../Component/TransfromComponent";
import CollisionComponent from "../Component/CollisionComponent";
import {Entity} from "../ECS/Entity";

/**
 * 碰撞系统
 */
export default class CollisionDetectionSystem implements System {

    world: World;

    type: SystemType = SystemType.Physics;

    onUpdate() {
        let entitiesSet = this.world.getEntityByComponents([TransfromComponent, CollisionComponent]);

        let arrentites: Entity[] = [];

        //将Set集合转化为数组，然后清空数据
        entitiesSet.forEach((e) => {
            arrentites.push(e);
            e.getCompont(CollisionComponent).otherCollisionEntityIdx.length = 0;
        });

        for (let i = 0; i < arrentites.length; i++) {
            let entity = arrentites[i];

            let tranfrom = entity.getCompont(TransfromComponent);
            if (tranfrom.collisionRadius == -1) {
                continue;
            }
            let collision = entity.getCompont(CollisionComponent);

            for (let j = i + 1; j < arrentites.length; j++) {
                let otherEntity = arrentites[j];
                let otherTranfrom = otherEntity.getCompont(TransfromComponent);
                if (otherTranfrom.collisionRadius == -1) {
                    continue;
                }
                let otherCollision = otherEntity.getCompont(CollisionComponent);

                let distance = Math.pow(otherTranfrom.posX - tranfrom.posX, 2) + Math.pow(otherTranfrom.posY - tranfrom.posY, 2);
                let radiusSum = tranfrom.collisionRadius * tranfrom.collisionRadius + otherTranfrom.collisionRadius * otherTranfrom.collisionRadius;

                if (distance < radiusSum) {
                    collision.otherCollisionEntityIdx.push(otherEntity.id);
                    otherCollision.otherCollisionEntityIdx.push(entity.id);
                    // console.log("发生碰撞 eids:", entity.id, otherEntity.id);
                }


            }
        }


    }

}