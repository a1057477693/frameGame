// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {Entity} from "../ECS/Entity";
import TransfromComponent from "../Component/TransfromComponent";
import MoveComponent from "../Component/MoveComponent";
import {GameStatusIdle, GameStatusType, GameStatusWalk} from "../GameStatus";
import {World} from "../ECS/World";
import GameUIBase from "./GameUIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBullet extends GameUIBase {


    transfromComponent: TransfromComponent = null;
    moveComponent: MoveComponent = null;
    backupedTransfromComponent: TransfromComponent = null;

    onLoad() {
        this.transfromComponent = this.entity.getCompont(TransfromComponent);
        this.moveComponent = this.entity.getCompont(MoveComponent);
        this.backupedTransfromComponent = this.entity.getBackupedComponent(TransfromComponent);

        this.updatePos();
    }

    update(dt: number) {
        super.update(dt);
        this.updatePos();
    }

    updatePos() {
        //渲染线性插值线的写法
        this.node.x = cc.misc.lerp(this.backupedTransfromComponent.posX, this.transfromComponent.posX, World.getInstance().uiLerpValue);
        this.node.y = cc.misc.lerp(this.backupedTransfromComponent.posY, this.transfromComponent.posY, World.getInstance().uiLerpValue);
        this.node.rotation = this.transfromComponent.rotation;

    }
}
