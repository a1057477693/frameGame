/**
 * 移动的数据构成
 */
import Component from "../ECS/Component";
import {ComponentType} from "../ECS/ECSConfig";
import {Direction} from "../Config";

/**
 * 移动时的数据
 */
export default class MoveComponent extends Component {

    type = ComponentType.Move;

    speedX: number = 0;  //x轴移动速度
    speedY: number = 0;  //y轴移动速度
    cfgSpeed: number = 10;  //移动速度

    dir: Direction = Direction.RIGHT; //移动方向

    mustInsideBorder: boolean = true; //用来标识是否必须在地图里，不能超过边界
}
