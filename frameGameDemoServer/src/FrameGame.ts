import Client from "./Client";
import {setInterval} from "timers";
import {
    GameMessageC2S_Operation, GameMessageOperationBody, GameMessageS2C_GameStart,
    GameMessageS2C_Operation
} from "./GameMessageBase";

export default class FrameGame {

    clients: Client[] = []; //客户端

    tickIntervalTime: number = 1 / 15 * 1000;  //帧率

    msgs: Map<number, GameMessageC2S_Operation> = new Map<number, GameMessageC2S_Operation>();//全部游戏操作集合 （旧）

    allMsgs: GameMessageC2S_Operation[] = [];//全部游戏操作数组（新）

    startTime: number = 0;//游戏开始时间

    ticIdx: number = 0;

    constructor(clients: Client[]) {
        this.clients = clients;

        let gameStart = new GameMessageS2C_GameStart();
        gameStart.uids = [];
        for (let i = 0; i < this.clients.length; i++) {
            let client = this.clients[i];
            client.game = this;
            gameStart.uids.push(client.uid);
        }
        for (let i = 0; i < this.clients.length; i++) {
            let client = this.clients[i];
            client.send(gameStart);
        }

        this.startTime=new Date().getTime();//记录起始时间

        setInterval(this.tick.bind(this), this.tickIntervalTime/5);
    }

    /**
     * 解决setInterval的时间延迟问题 受系统时间影响
     * @returns {boolean}
     */
    chekCanTick(): boolean {

        let time = new Date().getTime();
        if (time > this.startTime + this.ticIdx * this.tickIntervalTime) {
            return true;
        }

    }

    /**
     *对当前游戏的每个客户端发送游戏操作
     */
    tick() {
        //这里是之前的写法
        // let allOperation = new GameMessageS2C_Operation();
        // allOperation.operations = [];
        // this.msgs.forEach((value, key, map) => {
        //     allOperation.operations.push(value);
        // })
        //
        // for (let i = 0; i < this.clients.length; i++) {
        //     let client = this.clients[i];
        //     client.send(allOperation);
        // }
        // this.msgs.clear();


        //这里是新写法，所有消息不再根据Uid下发，所有消息都下发
        if (!this.chekCanTick()) {
            return;
        }
        this.ticIdx++;
        let allOperation = new GameMessageS2C_Operation();
        allOperation.operations = [];
        for (let i = 0; i < this.allMsgs.length; i++) {
            let msg = this.allMsgs[i];
            allOperation.operations.push(msg);
        }
        for (let i = 0; i < this.clients.length; i++) {
            let client = this.clients[i];
            client.send(allOperation);
        }
        this.allMsgs.length = 0;

    }

    /**
     * 接受客户端发来的操作 添加到全部游戏集合
     * @param {Client} client
     * @param {GameMessageC2S_Operation} msg
     */
    onReceive(client: Client, msg: GameMessageC2S_Operation) {
        //这里是之前的写法
        // if (!this.msgs.has(client.uid)) {
        //     this.msgs.set(client.uid, msg);
        // }

        //这里是新写法，所有消息不再根据Uid下发，所有消息都下发
        this.allMsgs.push(msg);
    }


}