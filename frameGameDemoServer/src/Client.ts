import WebSocket=require('ws');
import GameMessageBase, {GameMessageC2S_Operation, GameMessageType} from "./GameMessageBase";
import GameManager from "./GameManager";
import FrameGame from "./FrameGame";


export default class Client {

    ws: WebSocket;

    pairClient: Client;

    uid: number;

    game: FrameGame = null;


    constructor(socket: WebSocket) {
        this.ws = socket;

        //这里需要注意要是使用bind（this）,把this放到此函数的作用域
        //不使用的话不能使用ws的函数
        socket.on('message', this.onMessage.bind(this));
        socket.on("close", this.onClose.bind(this));
    }

    onMessage(data: WebSocket.Data) {
        let msg = JSON.parse(data as string) as GameMessageBase;
        console.log("onMessage", data);
        if (msg.type == GameMessageType.C2S_GameStart) {
            GameManager.getInstance(GameManager).gameStart();
        } else if (msg.type == GameMessageType.C2S_Operation) {
            this.game.onReceive(this, msg as GameMessageC2S_Operation);
        }
    }

    send(msg: GameMessageBase) {

        //这里判断可以提高服务器的健壮性
        if (this.ws.readyState == WebSocket.OPEN) {

            let string = JSON.stringify(msg);
            console.log("send :", string);
            this.ws.send(string);
        }


    }

    onClose() {
        GameManager.getInstance(GameManager).onClientClose(this);
    }
}