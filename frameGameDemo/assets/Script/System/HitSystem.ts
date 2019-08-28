import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/ECSConfig";
import CollisionComponent from "../Component/CollisionComponent";
import CampComponent from "../Component/CampComponent";
import BulletComponent from "../Component/BulletComponent";
import {Entity} from "../ECS/Entity";
import ActorStatusComponent from "../Component/ActorStatusComponent";
import GameUtils from "../GameUtils";

/**
 * 血量控制系统
 */
export default class HitSystem implements System {

    world: World;

    type: SystemType = SystemType.LogicAfterPhysics;

    onUpdate() {
        this.world.forEach([CollisionComponent, CampComponent, BulletComponent],
            (e: Entity, collision: CollisionComponent, camp: CampComponent, bullet: BulletComponent) => {

                for (let i = 0; i < collision.otherCollisionEntityIdx.length; i++) {
                    let otherEid = collision.otherCollisionEntityIdx[i];
                    let otherEntity = this.world.getEntityByEntityId(otherEid);
                    let otherActorStatus = otherEntity.getCompont(ActorStatusComponent);
                    let otherCamp = otherEntity.getCompont(CampComponent);
                    if (otherActorStatus && otherCamp && otherCamp.camp != camp.camp) {
                        //随机子弹暴击
                        let rnd = GameUtils.random(0, 100);
                        let dmgFactor = rnd > bullet.criticalRate ? 3 : 1;
                        otherActorStatus.healtPoint -= bullet.damage * dmgFactor;
                        this.world.getEntityByEntityId(bullet.fromEntityId).getCompont(ActorStatusComponent).score++;
                        console.log("子弹打到人！", rnd, dmgFactor);
                        //删除子弹
                        e.maskDestoyed();
                    }
                }

            }
        );
    }
}