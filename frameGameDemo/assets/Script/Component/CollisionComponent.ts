import {ComponentType} from "../ECS/ECSConfig";
import Component from "../ECS/Component";

/**
 * 碰撞的数据
 */
export default class CollisionComponent extends Component {

    type = ComponentType.Collision;

    otherCollisionEntityIdx: number[] = []; //保存这一帧谁和它发生了碰撞



}