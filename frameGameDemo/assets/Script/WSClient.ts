/**
 *@Author : Mr.zhh
 *@Date:  2018-12-19
 *@Project: frameGameDemo
 *@Describe: describe
 */

import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";
import GameMessageBase from "./GameMessageBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WSClient extends cc.Component {
    private static _instance: WSClient = null;

    static getInstance(): WSClient {
        return WSClient._instance;
    }

    ws: WebSocket;

    onLoad() {
        WSClient._instance = this;
        cc.game.addPersistRootNode(this.node);//常驻节点，切换场景不会被销毁
    }

    start() {

    }

    onDestroy() {
        console.log("WSClient onDestroy", this.ws);
    }

    onEnable() {
        console.log("WSClient onEnable", this.ws);
    }

    onDisable() {
        console.log("WSClient onDisable", this.ws);
    }

    connect() {
        let ws = new WebSocket("ws://127.0.0.1:8080");
        ws.onopen = (ev: Event) => {
            //ws.send(JSON.stringify({type: 1}));
            EventCenter.postEvent(EventDefine.EVENT_NETWORK_CONNECT);
        };
        ws.onmessage = (ev: MessageEvent) => {
           // console.log("onmessage", ev.data);

            let msg = JSON.parse(ev.data) as GameMessageBase;


            EventCenter.postEvent(msg.type.toString(), msg);

        };
        this.ws = ws;
    }

    send(msg: GameMessageBase) {
        let string = JSON.stringify(msg)
       // console.log("send :", string, this.ws);
        this.ws.send(string);
    }
}