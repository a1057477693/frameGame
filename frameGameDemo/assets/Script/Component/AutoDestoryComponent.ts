import {ComponentType} from "../ECS/ECSConfig";
import Component from "../ECS/Component";

/**
 * 自动销毁数据
 */
export default class AutoDestoryComponent extends Component {

    type = ComponentType.AutoDestory;

    lifeTime: number = 0;    //当前存在时间

    maxLifeTime: number = 20; //最大存在时间单位（帧）
}