import {System} from "../ECS/System";
import {World} from "../ECS/World";
import NetworkReceiveComponent from "../Component/NetworkReceiveComponent";
import {EntityType, SystemType} from "../ECS/ECSConfig";
import MoveComponent from "../Component/MoveComponent";
import FireComponent from "../Component/FireComponent";
import {Entity} from "../ECS/Entity";
import TransfromComponent from "../Component/TransfromComponent";
import {Direction} from "../Config";
import CampComponent from "../Component/CampComponent";
import BulletComponent from "../Component/BulletComponent";
import CollisionComponent from "../Component/CollisionComponent";
import AutoDestoryComponent from "../Component/AutoDestoryComponent";
import GameUtils from "../GameUtils";

/**
 * 开火系统
 */
export default class FireSystem implements System {

    world: World;

    type: SystemType = SystemType.LogicBeforePhysics;

    onUpdate() {
        let msgOp = this.world.getSingletonEntityComponent(NetworkReceiveComponent);
        if (msgOp.msgThisLogic) {
            for (let i = 0; i < msgOp.msgThisLogic.operations.length; i++) {
                let op = msgOp.msgThisLogic.operations[i];

                let entity = this.world.getEntityByEntityId(op.entityId);
                if (entity && entity.hasComponent(FireComponent)) {
                    let fireComponent = entity.getCompont(FireComponent);
                    fireComponent.wantFire = op.body.isFire;
                    fireComponent.angle = op.body.angle;
                    if (fireComponent.angle = -1) {
                        let move = entity.getCompont(MoveComponent);
                        fireComponent.angle = this.getAngleByDir(move.dir);
                    }
                }

            }
        }
        this.world.forEach([FireComponent], (entity: Entity, fire: FireComponent) => {
            //如果开火的冷缺时间为0,并且玩家想开火，就设置成开火状态
            if (fire.currentCoolDown == 0 && fire.wantFire) {
                fire.isFire = true;
                fire.currentCoolDown = fire.maxCoolDown;
            }
            if (fire.currentCoolDown > 0) {
                fire.currentCoolDown--;
            }
            //判断是否在开火状态
            if (fire.isFire) {
                //如果当前开火动画没有播放完毕
                if (fire.currentFrame < fire.totalFireFrame) {
                    fire.currentFrame++;
                    //如果当前帧等于开火帧，就生成子弹
                    if (fire.currentFrame == fire.fireFrame) {
                        this.generateBullet(fire, entity);
                    }
                }
                //如果当前动画播放完毕
                if (fire.currentFrame == fire.totalFireFrame) {
                    fire.currentFrame = 0;
                    fire.isFire = false;
                }
            }

        });
    }

    /**
     * 生成子弹
     * @param {FireComponent} fire
     * @param fromEntity
     */
    generateBullet(fire: FireComponent, fromEntity: Entity) {
        let entity = this.world.getNewEntity(EntityType.Bullet);
        let move = entity.addCompont(MoveComponent);
        let transFrom = entity.addCompont(TransfromComponent);
        let camp = entity.addCompont(CampComponent);
        let bullet = entity.addCompont(BulletComponent);
        let collision = entity.addCompont(CollisionComponent);
        let autoDestory = entity.addCompont(AutoDestoryComponent);
        move.cfgSpeed = 50;
        move.mustInsideBorder = false;

        this.parseBulletMove(fire.angle, move, transFrom);
        //子弹初始位置
        transFrom.posX = fromEntity.getCompont(TransfromComponent).posX;
        transFrom.posY = fromEntity.getCompont(TransfromComponent).posY;
        transFrom.collisionRadius = 5;

        //阵营
        camp.camp = fromEntity.getCompont(CampComponent).camp;

        bullet.fromEntityId = fromEntity.id;

        //将子弹加入场景中去
        World.getInstance().addEntityToWorld(entity);

    }

    /**
     * 子弹移动
     * @param {Direction} dir
     * @param {MoveComponent} move
     * @param {TransfromComponent} tranFrom
     */
    parseBulletMove(angle: number, move: MoveComponent, tranFrom: TransfromComponent) {
        // if (dir == Direction.TOP) {
        //     move.speedX = 0;
        //     move.speedY = 50;
        //     tranFrom.rotation = 90;
        // } else if (dir == Direction.DOWN) {
        //     move.speedX = 0;
        //     move.speedY = -50;
        //     tranFrom.rotation = -90;
        // } else if (dir == Direction.RIGHT) {
        //     move.speedX = 50;
        //     move.speedY = 0;
        //     tranFrom.rotation = 0;
        // } else if (dir == Direction.LEFT) {
        //     move.speedX = -50;
        //     move.speedY = 0;
        //     tranFrom.rotation = 180;
        // }
        // move.dir = dir;

        tranFrom.rotation = -angle;
        let speedVector = GameUtils.angleToVector(angle);
        move.speedX = speedVector.x * move.cfgSpeed;
        move.speedY = speedVector.y * move.cfgSpeed;

    }

    getAngleByDir(dir: number): number {
        if (dir == Direction.TOP) {
            return 90;
        } else if (dir == Direction.DOWN) {
            return 270;
        } else if (dir == Direction.RIGHT) {
            return 0;
        } else if (dir == Direction.LEFT) {
            return 180;
        } else {
            return 0;
        }
    }

}