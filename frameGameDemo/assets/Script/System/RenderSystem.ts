import {System} from "../ECS/System";
import {World} from "../ECS/World";
import {EntityType, SystemType} from "../ECS/ECSConfig";
import GameActor from "../UI/GameActor";
import GameBullet from "../UI/GameBullet";
import GameUIBase from "../UI/GameUIBase";

const {ccclass, property} = cc._decorator;
/**
 * 渲染系统
 */
@ccclass
export default class RenderSystem extends cc.Component implements System {

    world: World;

    type: SystemType = SystemType.Render;

    //要渲染的组件
    @property(cc.Prefab)
    prefabArrow: cc.Prefab = null;
    @property(cc.Prefab)
    prefabBullet: cc.Prefab = null;


    allRenderUI: GameUIBase[] = [];

    static intance: RenderSystem = null;

    static getIntance(): RenderSystem {
        return this.intance;
    }

    onLoad() {
        RenderSystem.intance = this;
        World.getInstance().addSystemToCyle(this);
    }

    onUpdate() {
        let entites = this.world.newEntitiesInThisCyle;
        for (let i = 0; i < entites.length; i++) {
            let entity = entites[i];
            let uiBase: GameUIBase = null;
            if (entity.type == EntityType.Actor) {
                uiBase = cc.instantiate(this.prefabArrow).getComponent("GameActor") as GameActor;
            } else if (entity.type == EntityType.Bullet) {
                uiBase = cc.instantiate(this.prefabBullet).getComponent("GameBullet") as GameBullet;
            }

            if (uiBase) {
                uiBase.entity = entity;
                uiBase.node.setParent(this.node);
                this.allRenderUI.push(uiBase);
            }
        }
    }

    removeUIBase(uiBase: GameUIBase) {
        let idx = this.allRenderUI.indexOf(uiBase);
        if (idx != -1) {
            this.allRenderUI.splice(idx);
        }

    }

}
