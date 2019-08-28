import {ComponentType} from "../ECS/ECSConfig";
import Component from "../ECS/Component";

/**
 * 阵营的数据
 */
export default class CampComponent extends Component {

    type = ComponentType.Camp;

    camp: number = -1; //阵营
}