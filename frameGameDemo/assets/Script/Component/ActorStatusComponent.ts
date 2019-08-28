import {ComponentType} from "../ECS/ECSConfig";
import Component from "../ECS/Component";

/**
 * Acotor信息数据
 */
export default class ActorStatusComponent extends Component {

    type = ComponentType.Actor;

    healtPoint: number = 100;    //当前血量

    maxHealtPoint: number = 100; //最大血量

    score: number = 0; //获得的分数

    isDie: boolean = false;//是否死亡
}