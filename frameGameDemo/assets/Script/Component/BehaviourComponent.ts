import Component from "../ECS/Component";
import {ComponentType} from "../ECS/ECSConfig";

/**
 * AI行为数据
 */
export default class BehaviourComponent extends Component {

    type = ComponentType.Behaviour;

    //AI行为权重
    attackWeight: number = 50;
    moveWeight: number = 50;
    idleWeight: number = 50;

    actionInterval: number = 50; //行动间隔
    coolDown: number = 30;//冷却时间
}