import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {SystemType} from "../ECS/ECSConfig";
import {Entity} from "../ECS/Entity";
import NetworkReceiveComponent from "../Component/NetworkReceiveComponent";
import MoveComponent from "../Component/MoveComponent";
import TransfromComponent from "../Component/TransfromComponent";
import {GameMessageOperationBody} from "../GameMessageBase";
import {Direction, GameConfig} from "../Config";
import GameUtils from "../GameUtils";

/**
 * 移动系统
 */
export default class MoveSystem implements System {

    world: World;

    type: SystemType = SystemType.Physics;

    onUpdate() {
        let msgOp = this.world.getSingletonEntityComponent(NetworkReceiveComponent);
        //如果当前帧没有包数据要处理就return  (这是之前的写法没有考虑网络延迟发包)
        // if (!msgOp.msgThisLogic || msgOp.msgThisLogic.operations.length == 0) {
        //     return;
        // }

        // this.world.forEach([MoveComponent,TransfromComponent], (entity: Entity, move: MoveComponent, tranform: TransfromComponent) => {
        //     for (let i = 0; i < msgOp.msgThisLogic.operations.length; i++) {
        //         let op = msgOp.msgThisLogic.operations[i];
        //
        //         if (op.entityId == entity.id) {
        //             this.parseMsgtoMove(op.body, move);
        //         }
        //     }
        //     tranform.posX += move.speedX;
        //     tranform.posY += move.speedY;
        // });

        ////////////////////////////////////
        if (msgOp.msgThisLogic) {
            for (let i = 0; i < msgOp.msgThisLogic.operations.length; i++) {
                let op = msgOp.msgThisLogic.operations[i];
                let entity = this.world.getEntityByEntityId(op.entityId);
                if (entity.hasComponent(MoveComponent)) {
                    MoveSystem.parseMsgtoMove(op.body, entity.getCompont(MoveComponent));
                }

            }
        }
        this.world.forEach([MoveComponent, TransfromComponent], (entity: Entity, move: MoveComponent, tranform: TransfromComponent) => {
            tranform.posX += move.speedX;
            tranform.posY += move.speedY;

            this.checkBorder(tranform, move);
        });
    }

    /**
     * 检查地图边界
     * @param {TransfromComponent} transfrom
     * @param {MoveComponent} move
     */
    checkBorder(transfrom: TransfromComponent, move: MoveComponent) {
        if (!move.mustInsideBorder) {
            return;
        }
        //如果角色超过地图边界，重新设置坐标
        if (transfrom.posX < -GameConfig.mapWidth * 0.5) {
            transfrom.posX = -GameConfig.mapWidth * 0.5;
        } else if (transfrom.posX > GameConfig.mapWidth * 0.5) {
            transfrom.posX = GameConfig.mapWidth * 0.5;
        }

        if (transfrom.posY < -GameConfig.mapHeight * 0.5) {
            transfrom.posY = -GameConfig.mapHeight * 0.5;
        } else if (transfrom.posY > GameConfig.mapHeight * 0.5) {
            transfrom.posY = GameConfig.mapHeight * 0.5;
        }
    }

    /**
     * 根据服务器消息移动
     * @param {GameMessageOperationBody} op
     * @param {MoveComponent} move
     */
    static parseMsgtoMove(op: GameMessageOperationBody, move: MoveComponent) {
        // if (op.dir == Direction.NONE) {
        //     move.speedX = 0;
        //     move.speedY = 0;
        // } else if (op.dir == Direction.TOP) {
        //     move.speedX = 0;
        //     move.speedY = 10;
        // } else if (op.dir == Direction.DOWN) {
        //     move.speedX = 0;
        //     move.speedY = -10;
        // } else if (op.dir == Direction.LEFT) {
        //     move.speedX = -10;
        //     move.speedY = 0;
        // } else if (op.dir == Direction.RIGHT) {
        //     move.speedX = 10;
        //     move.speedY = 0;
        // }
        this.parseAngletoMove(op.angle, move);
        if (op.dir != Direction.NONE) {
            move.dir = op.dir;
        }
    }

    /**
     *根据角度移动
     * @param {number} angle
     * @param {MoveComponent} move
     */
    static parseAngletoMove(angle: number, move: MoveComponent) {
        if (angle != -1) {
            let speedVector = GameUtils.angleToVector(angle);
            move.speedX = move.cfgSpeed * speedVector.x;
            move.speedY = move.cfgSpeed * speedVector.y;
        } else {
            move.speedX = 0;
            move.speedY = 0;
        }
    }
}