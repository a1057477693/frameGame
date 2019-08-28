import ActorStatusComponent from "../Component/ActorStatusComponent";
import {World} from "../ECS/World";
import {System} from "../ECS/System";
import {Entity} from "../ECS/Entity";
import {SystemType} from "../ECS/ECSConfig";
import BehaviourComponent from "../Component/BehaviourComponent";
import MoveComponent from "../Component/MoveComponent";
import TransfromComponent from "../Component/TransfromComponent";
import FireComponent from "../Component/FireComponent";
import GameUtils from "../GameUtils";
import CampComponent from "../Component/CampComponent";
import MoveSystem from "./MoveSystem";

/**
 * AI系统
 */
export default class AISystem implements System {

    world: World;

    type: SystemType = SystemType.LogicAfterPhysics;

    onUpdate() {
        this.world.forEach([BehaviourComponent, MoveComponent, TransfromComponent, FireComponent],
            (e: Entity, behaviour: BehaviourComponent, move: MoveComponent, trans: TransfromComponent, fire: FireComponent) => {
                if (behaviour.coolDown > 0) {
                    behaviour.coolDown--;
                }
                if (behaviour.coolDown == 0) {
                    this.clear(move, fire);
                    let rand = this.getRandomResult(behaviour);
                    if (rand < behaviour.attackWeight) {
                        this.setFire(e, fire, trans);
                    } else if (rand < behaviour.attackWeight + behaviour.moveWeight) {
                        this.setWalk(e, move, trans);
                    }
                    behaviour.coolDown = Math.floor(GameUtils.random(0, behaviour.actionInterval));
                }

            }
        );
    }

    /**
     * 清除AI  MoveComponent FireComponent  数据
     * @param {MoveComponent} move
     * @param {FireComponent} fire
     */
    clear(move: MoveComponent, fire: FireComponent) {
        move.speedX = 0;
        move.speedY = 0;
        fire.wantFire = false;
    }

    /**
     * 随机行为
     */
    getRandomResult(behaviour: BehaviourComponent): number {

        let randResult = GameUtils.random(0, behaviour.attackWeight + behaviour.moveWeight + behaviour.idleWeight);
        return randResult;
    }

    /**
     * 设置AI的开火
     * @param {Entity} entity
     * @param {FireComponent} fire
     * @param {TransfromComponent} trans
     */
    setFire(entity: Entity, fire: FireComponent, trans: TransfromComponent) {
        let enemy = this.getNearesEnemy(entity, trans);
        if (!enemy) {
            return;
        }
        let enemyPos = cc.v2(enemy.getCompont(TransfromComponent).posX, enemy.getCompont(TransfromComponent).posY);
        fire.wantFire = true;
        let subValue = enemyPos.sub(cc.v2(trans.posX, trans.posY));
        fire.angle = Math.round(cc.misc.radiansToDegrees(Math.atan2(subValue.y, subValue.x)));
    }

    /**
     * 设置AI的行走
     * @param {Entity} entity
     * @param {MoveComponent} move
     * @param {TransfromComponent} trans
     */
    setWalk(entity: Entity, move: MoveComponent, trans: TransfromComponent) {
        let enemy = this.getNearesEnemy(entity, trans);
        if (!enemy) {
            return;
        }
        let enemyPos = cc.v2(enemy.getCompont(TransfromComponent).posX, enemy.getCompont(TransfromComponent).posY);
        let subValue = enemyPos.sub(cc.v2(trans.posX, trans.posY));
        let angle = Math.round(cc.misc.radiansToDegrees(Math.atan2(subValue.y, subValue.x)));
        MoveSystem.parseAngletoMove(angle, move);
    }

    /**
     * 获取AI最近的敌人
     * @param {Entity} entity
     * @param {TransfromComponent} trans
     * @returns {Entity}
     */
    getNearesEnemy(entity: Entity, trans: TransfromComponent): Entity {

        let allEnemy = this.world.getEntityByComponents([CampComponent, ActorStatusComponent, TransfromComponent]);
        let entityCamp = entity.getCompont(CampComponent);
        let nearesEnemy: Entity = null;
        let nearesDis = -1;

        allEnemy.forEach((enemy: Entity) => {
            let enemyTrans = enemy.getCompont(TransfromComponent);
            let enemyCamp = enemy.getCompont(CampComponent);
            if (enemyCamp != entityCamp) {
                let dis = Math.pow(enemyTrans.posX - trans.posX, 2) + Math.pow(enemyTrans.posY - trans.posY, 2);
                if (dis > nearesDis) {
                    nearesDis = dis;
                    nearesEnemy = enemy;
                }
            }
        })
        return nearesEnemy;
    }
}