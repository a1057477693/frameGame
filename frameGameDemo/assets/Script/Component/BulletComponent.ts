import {ComponentType} from "../ECS/ECSConfig";
import Component from "../ECS/Component";
import {Entity} from "../ECS/Entity";

/**
 * 子弹的数据
 */
export default class BulletComponent extends Component {

    type = ComponentType.Bullet;

    fromEntityId: number = -1;  //谁射出的子弹

    damage: number = 10;//子弹的伤害

    criticalRate: number = 50;// 暴击概率
}