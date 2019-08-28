// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import GameSquare from "./UI/GameActor";
import {Direction} from "./Config";
import WSClient from "./WSClient";
import EventCenter from "./EventCenter";
import {
    default as GameMessageBase, GameMessageC2S_GameStart, GameMessageC2S_Operation, GameMessageOperationBody,
    GameMessageS2C_GameStart,
    GameMessageS2C_Operation,
    GameMessageS2C_Uid,
    GameMessageType
} from "./GameMessageBase";
import GameService from "./GameService";
import {World} from "./ECS/World";
import {CycleType, EntityType} from "./ECS/ECSConfig";
import TransfromComponent from "./Component/TransfromComponent";
import MoveComponent from "./Component/MoveComponent";
import NetworkReceiveComponent from "./Component/NetworkReceiveComponent";
import FireComponent from "./Component/FireComponent";
import CollisionComponent from "./Component/CollisionComponent";
import ActorStatusComponent from "./Component/ActorStatusComponent";
import CampComponent from "./Component/CampComponent";
import GameUtils from "./GameUtils";
import BehaviourComponent from "./Component/BehaviourComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Prefab)
    prefabGameSquare: cc.Prefab;  //方块

    @property(cc.Label)
    lbUid: cc.Label;  //UID标签

    @property(cc.Node)
    hideOnGame: cc.Node;


    squares: Map<number, GameSquare> = new Map<number, GameSquare>();//方块集合

    pressingKeys: Map<number, boolean> = new Map<number, boolean>();//键值集合

    uid: number;//UID

    static selfEntityId: number = 0;

    isInGame: boolean = false; //是否在游戏中

    lastSendDir: Direction = Direction.NONE;

    lastIsFire: boolean = false;

    onLoad() {
        let ans = GameUtils.angleToVector(30);

        //注册键盘事件
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        //为当前场景注册以下事件
        EventCenter.registerEvent("2", this.onGetUid, this);
        EventCenter.registerEvent("3", this.onGetGameStart, this);
        EventCenter.registerEvent("4", this.onGetOperation, this);
    }

    start() {
        WSClient.getInstance().connect();
    }

    /**
     * 获取UID
     * @param {GameMessageS2C_Uid} msg
     */
    onGetUid(msg: GameMessageS2C_Uid) {
        this.uid = msg.uid;
        this.lbUid.string = "ID:" + this.uid.toString();
    }

    /**
     * 获取游戏开始
     * @param {GameMessageS2C_GameStart} msg
     */
    onGetGameStart(msg: GameMessageS2C_GameStart) {
       this.hideOnGame.active = false;
        //启动ESC
        GameService.initWorld();

        for (let i = 0; i < msg.uids.length; i++) {
            let uid = msg.uids[i];
            this.addPlayer(uid, i);
        }
        //添加AI;
        this.addAI();

        this.isInGame = true;

        World.getInstance().netWorkUpdateInterval = 1000 / 15;
        World.getInstance().fixedUpdateInterval = 1000 / 30;
        World.getInstance().cycleType = CycleType.Network;
        World.getInstance().regisNetWorkLogicCycle(GameService.logicCycleThisCycle);
        World.getInstance().getSingletonEntityComponent(NetworkReceiveComponent).startTime = new Date().getTime();
        World.getInstance().startCyle();
    }

    /**
     *获取操作
     * @param {GameMessageS2C_Operation} msg
     */
    onGetOperation(msg: GameMessageS2C_Operation) {
        //这里是ECS的写法
        let nrc = World.getInstance().getSingletonEntityComponent(NetworkReceiveComponent);
        nrc.msgToDeal.push(msg);

        ///这里是之前的写法
        // for (let i = 0; i < msg.operations.length; i++) {
        //     let op = msg.operations[i];
        //     let square = this.squares.get(op.uid);
        //     square.dealOperation(op)
        // }
    }

    /**
     * 添加角色
     * @param {number} uid
     */
    addPlayer(uid: number, campId: number) {
        //这里是ECS的写法
        let player = World.getInstance().getNewEntity(EntityType.Actor);
        World.getInstance().addEntityToWorld(player);
        //添加需要的Component
        let trans = player.addCompont(TransfromComponent);
        player.addCompont(MoveComponent);
        player.addCompont(FireComponent);
        player.addCompont(ActorStatusComponent);
        let camp = player.addCompont(CampComponent);
        let collision = player.addCompont(CollisionComponent);

        trans.collisionRadius = 20;
        camp.camp = campId;
        if (uid == this.uid) {
            Main.selfEntityId = player.id;
        }


        //这里是之前的写法
        // let square = cc.instantiate(this.prefabGameSquare).getComponent("GameActor") as GameActor;
        // this.squares.set(uid, square);
        // square.node.setParent(this.node);
    }

    /**
     * 添加AI
     */
    addAI() {
        let player = World.getInstance().getNewEntity(EntityType.Actor);

        let trans = player.addCompont(TransfromComponent);
        player.addCompont(MoveComponent);
        player.addCompont(FireComponent);
        player.addCompont(ActorStatusComponent);
        player.addCompont(BehaviourComponent);
        let camp = player.addCompont(CampComponent);
        // let collision = player.addCompont(CollisionComponent);


        trans.collisionRadius = 20;
        camp.camp = 1000;

        World.getInstance().addEntityToWorld(player);
    }

    onKeyDown(event: cc.Event.EventCustom) {
        this.pressingKeys.set(event.keyCode, true);

    }

    onKeyUp(event: cc.Event.EventCustom) {
        this.pressingKeys.set(event.keyCode, false);
    }

    update(dt: number) {
        if (this.isInGame) {

            World.getInstance().cycle();

            this.sendOp();
        }
    }

    /**
     * 发送当前操作到服务器
     */
    sendOp() {

        let dir = Direction.NONE;
        let angle = -1;

        if (this.pressingKeys.get(cc.macro.KEY.left)) {
            dir = Direction.LEFT;
            angle = 180;
        } else if (this.pressingKeys.get(cc.macro.KEY.right)) {
            dir = Direction.RIGHT;
            angle = 0;
        } else if (this.pressingKeys.get(cc.macro.KEY.up)) {
            dir = Direction.TOP;
            angle = 90;
        } else if (this.pressingKeys.get(cc.macro.KEY.down)) {
            dir = Direction.DOWN;
            angle = 270;
        } else {
            dir = Direction.NONE;
            angle = -1;
        }
        let isFire = this.pressingKeys.get(cc.macro.KEY.space);

        if (dir != this.lastSendDir || isFire != this.lastIsFire) {
            let msg = new GameMessageC2S_Operation();
            msg.uid = this.uid;
            msg.entityId = Main.selfEntityId;
            msg.body = new GameMessageOperationBody();
            msg.body.dir = dir;
            msg.body.isFire = isFire;
            msg.body.angle = angle;
            WSClient.getInstance().send(msg);

            this.lastSendDir = dir;
            this.lastIsFire = isFire;
        }

    }

    /**
     * 点击游戏开始
     */
    onClickGameStart() {
        WSClient.getInstance().send(new GameMessageC2S_GameStart());
    }
}

