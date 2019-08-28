import Component from "../ECS/Component";
import {ComponentType} from "../ECS/ECSConfig";

/**
 * 移动后和碰撞后等的一下数据改变后的值
 */
export default class TransfromComponent extends Component {

    type = ComponentType.Transfrom;

    posX: number = 0;   //X轴坐标
    posY: number = 0;  //Y轴坐标
    rotation: number = 0;      //旋转角度
    needBackUp: boolean = true; //是否需要备份
    collisionRadius: number = -1//碰撞半径值  -1标识没有碰撞

}
