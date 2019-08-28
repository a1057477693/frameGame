import Singleton from "./Singleton";
import Client from "./Client";
import {GameMessageS2C_Uid} from "./GameMessageBase";
import FrameGame from "./FrameGame";


export default class GameManager extends Singleton<GameManager> {

    allClient: Client[] = [];  //所有的客户端

    matchingClient: Client[] = [];//正在匹配的数组

    allGames: FrameGame[] = [];  //所有的游戏

    uidIdx: number = 100; //分配给玩家的UID

    /**
     * 添加客户端
     * @param {Client} client
     */
    addClient(client: Client) {
        this.allClient.push(client);
        this.matchingClient.push(client);
        client.uid = this.uidIdx;
        this.uidIdx++;
        //把分配到UID发到客户端
        let msg = new GameMessageS2C_Uid();
        msg.uid = client.uid;
        client.send(msg);
    }

    /**
     * 游戏开始
     */
    gameStart() {
        //添加当前游戏到游戏数组
        let game = new FrameGame(this.matchingClient);
        this.allGames.push(game);
        this.matchingClient = [];
    }

    /**
     * 客户端关闭清理
     * @param {Client} client
     */
    onClientClose(client: Client) {
        let idx = this.allClient.indexOf(client);
        if (idx != -1) {
            this.allClient.splice(idx, 1);
        }
        idx = this.matchingClient.indexOf(client);
        if (idx != -1) {
            this.matchingClient.splice(idx, 1);
        }
    }

    // checkInGame(uid: string, callBack: GameMessageS2C_Login, client: Client): boolean {
    //     for (let i = 0; i < this.allGameData.length; i++) {
    //         let game = this.allGameData[i];
    //         if (game.disconnectUid = uid) {
    //             let sync = new GameMessageSync();
    //             sync.myUid = uid;
    //             sync.otherUid = game.clients[0].uid;
    //             sync.myChessType = game.getPairChessType();
    //             sync.tableDatas = game.tablcData;
    //             callBack.sync = sync;
    //             game.reconnect(client);
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}