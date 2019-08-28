
import Component from "../ECS/Component";
import {ComponentType} from "../ECS/ECSConfig";
import {GameMessageS2C_Operation} from "../GameMessageBase";
/**
 * 网络的数据构成
 */
export default class NetworkReceiveComponent extends Component {

    type: ComponentType = ComponentType.NetworkReceive;

    msgToDeal: GameMessageS2C_Operation[] = []; //通过网络下发要执行的全部操作
    dealIdx: number = 0;  //
    msgThisLogic: GameMessageS2C_Operation = null;
    startTime: number = 0;

}
