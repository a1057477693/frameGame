import {Entity} from "../ECS/Entity";
import RenderSystem from "../System/RenderSystem";

const {ccclass, property} = cc._decorator;

/**
 * UI组件的父类
 */
@ccclass
export default class GameUIBase extends cc.Component {
    entity: Entity;

    update(dt: number) {
        //判断entity是否有值并且被标记销毁
        if (this.entity && this.entity.destoyed) {
            this.node.removeFromParent(true);
            this.node.destroy();

            RenderSystem.getIntance().removeUIBase(this);
        }
    }
}