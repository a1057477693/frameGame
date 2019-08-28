import {ComponentType} from "../ECS/ECSConfig";
import Component from "../ECS/Component";

/**
 * 开火时的数据
 */
export default class FireComponent extends Component {

    type = ComponentType.Fire;

    wantFire: boolean = false; //玩家想不想进入开枪的状态

    currentCoolDown: number = 0;//冷却时间

    maxCoolDown: number = 30;//最大的冷却时间

    isFire: boolean = false;//当前是不是开火状态

    currentFrame: number = 0;//执行到多少帧，当前的动作

    fireFrame: number = 6;//第几帧开火

    totalFireFrame: number = 15;//总共多少帧

    angle: number = -1    //子弹发射角度

}