// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import TransfromComponent from "../Component/TransfromComponent";
import GameStatusMachine from "../GameStatusMachine";
import {GameStatusDie, GameStatusFire, GameStatusIdle, GameStatusType, GameStatusWalk} from "../GameStatus";
import MoveComponent from "../Component/MoveComponent";
import {World} from "../ECS/World";
import GameUIBase from "./GameUIBase";
import FireComponent from "../Component/FireComponent";
import ActorStatusComponent from "../Component/ActorStatusComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameActor extends GameUIBase {

    @property(cc.Sprite)
    spActor: cc.Sprite;
    @property([cc.SpriteFrame])
    sfIdle: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sfWalk: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sfFire: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sfDie: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    spHpBar: cc.Sprite;

    animIdleTotalTime: number = 1;
    animWalkTotalTime: number = 1;
    animDieTotalTime: number = 1;

    statusMachine: GameStatusMachine = null;
    enterIdelCount: number = 0; //此变量用于解决Idle和Walk转台切换是的抖动(此方法较Low,后面使用了渲染线性插值的方法)


    transfromComponent: TransfromComponent = null;
    moveComponent: MoveComponent = null;
    backupedTransfromComponent: TransfromComponent = null;
    fireComponent: FireComponent = null;
    actorStatusComponent: ActorStatusComponent = null;


    onLoad() {
        this.transfromComponent = this.entity.getCompont(TransfromComponent);
        this.moveComponent = this.entity.getCompont(MoveComponent);
        this.backupedTransfromComponent = this.entity.getBackupedComponent(TransfromComponent);
        this.fireComponent = this.entity.getCompont(FireComponent);
        this.actorStatusComponent = this.entity.getCompont(ActorStatusComponent);

        //状态机
        this.statusMachine = new GameStatusMachine(this);
        this.statusMachine.changeStatus(new GameStatusIdle());


    }

    update(dt: number) {
        super.update(dt);
        let isMove = this.checkIsMove();
        let isFire = this.checkIsFire();
        let isDie = this.checkIsDie();
        //状态的切换
        if (isDie ) {
            if(this.statusMachine.currStartus.status != GameStatusType.Die){
                this.statusMachine.changeStatus(new GameStatusDie());
            }
        } else {
            if (isFire && this.statusMachine.currStartus.status != GameStatusType.Fire) {
                this.statusMachine.changeStatus(new GameStatusFire());
            } else if (!isFire && isMove && this.statusMachine.currStartus.status != GameStatusType.Walk) {
                this.statusMachine.changeStatus(new GameStatusWalk());
            } else if (!isFire && !isMove && this.statusMachine.currStartus.status != GameStatusType.Idle) {
                if (this.enterIdelCount > 3) {
                    this.statusMachine.changeStatus(new GameStatusIdle());
                    this.enterIdelCount = 0;
                } else {
                    this.enterIdelCount++;
                }
            }
        }


        //渲染线性插值前的写法
        // this.node.x = this.transfromComponent.posX;
        // this.node.y = this.transfromComponent.posY;

        //渲染线性插值线的写法
        this.node.x = cc.misc.lerp(this.backupedTransfromComponent.posX, this.transfromComponent.posX, World.getInstance().uiLerpValue);
        this.node.y = cc.misc.lerp(this.backupedTransfromComponent.posY, this.transfromComponent.posY, World.getInstance().uiLerpValue);

        this.statusMachine.update(dt);

        this.updateHp();

    }

    //是否在移动
    checkIsMove(): boolean {
        //渲染线性插值前的写法
        // return this.node.x != this.transfromComponent.posX || this.node.y != this.transfromComponent.posY;

        //渲染线性插值线的写法
        return this.backupedTransfromComponent.posX != this.transfromComponent.posX || this.backupedTransfromComponent.posY != this.transfromComponent.posY;
    }

    //是否在开枪
    checkIsFire(): boolean {
        return this.fireComponent.currentFrame > 0;
    }

    //是否死亡
    checkIsDie(): boolean {
        return this.actorStatusComponent.isDie;
    }

    /**
     * 更新血量
     */
    updateHp() {
        let hpPerent = this.actorStatusComponent.healtPoint / this.actorStatusComponent.maxHealtPoint;
        this.spHpBar.fillRange = hpPerent;
    }

    //这里是之前的写法
    // /**
    //  * 方块移动
    //  * @param {Direction} dir
    //  */
    // move(dir: Direction) {
    //
    //     switch (dir) {
    //         case Direction.TOP:
    //             this.node.y += 10;
    //             break;
    //         case Direction.DOWN:
    //             this.node.y -= 10;
    //             break;
    //         case Direction.RIGHT:
    //             this.node.x += 10;
    //             break;
    //         case Direction.LEFT:
    //             this.node.x -= 10;
    //             break;
    //
    //     }
    // }
    //
    // //执行操作
    // dealOperation(op: GameMessageC2S_Operation) {
    //     if (op.body.dir == Direction.LEFT) {
    //         this.move(Direction.LEFT);
    //     } else if (op.body.dir == Direction.RIGHT) {
    //         this.move(Direction.RIGHT);
    //     } else if (op.body.dir == Direction.TOP) {
    //         this.move(Direction.TOP);
    //     } else if (op.body.dir == Direction.DOWN) {
    //         this.move(Direction.DOWN);
    //     }
    // }
}
