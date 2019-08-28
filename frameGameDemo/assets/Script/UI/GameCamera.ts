// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import RenderSystem from "../System/RenderSystem";
import Main from "../Main";
import GameUtils from "../GameUtils";
import {GameConfig} from "../Config";

const {ccclass, property, executionOrder} = cc._decorator;
//executionOrder 设置脚本生命周期方法调用的优先级。优先级小于 0 的组件将会优先执行，优先级大于 0 的组件将会延后执行。优先级仅会影响 onLoad, onEnable, start, update 和 lateUpdate，而 onDisable 和 onDestroy 不受影响。
@ccclass
@executionOrder(10)
export default class GameCamera extends cc.Component {

    target: cc.Node = null;

    minX: number = 0;
    maxX: number = 0;
    minY: number = 0;
    maxY: number = 0;


    onLoad() {
        let winSize = cc.director.getWinSize();
        this.minX = (-GameConfig.mapWidth + winSize.width) * 0.5;
        this.maxX = (GameConfig.mapWidth - winSize.width) * 0.5;
        this.minY = (-GameConfig.mapHeight + winSize.height) * 0.5;
        this.maxY = (GameConfig.mapHeight - winSize.height) * 0.5;
    }


    update(dt: number) {
        if (!this.target) {
            let allRenderUI = RenderSystem.getIntance().allRenderUI;

            for (let i = 0; i < allRenderUI.length; i++) {
                let renderUI = allRenderUI[i];
                if (renderUI.entity.id == Main.selfEntityId) {
                    this.target = renderUI.node;
                }
            }
        }

        if (this.target) {
            //this.node.position = this.target.position;

            this.node.x = Math.min(this.maxX, Math.max(this.target.x, this.minX));
            this.node.y = Math.min(this.maxY, Math.max(this.target.y, this.minY));
        }

    }
}
