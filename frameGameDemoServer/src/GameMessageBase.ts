
import {Direction} from "./Config";


export default class GameMessageBase {
    type: GameMessageType;

}

export enum GameMessageType {
    C2S_GameStart,
    C2S_Operation,
    S2C_Uid,
    S2C_GameStart,
    S2C_Operation,
}

export class GameMessageC2S_GameStart extends GameMessageBase {
    type: GameMessageType=GameMessageType.C2S_GameStart;

}

export class GameMessageS2C_GameStart extends GameMessageBase {
    type: GameMessageType=GameMessageType.S2C_GameStart;
    uids: number[];

}

export class GameMessageS2C_Uid extends GameMessageBase {
    type:GameMessageType= GameMessageType.S2C_Uid;
    uid: number;

}

export class GameMessageC2S_Operation extends GameMessageBase {
    type: GameMessageType=GameMessageType.C2S_Operation;
    uid: number;
    body: GameMessageOperationBody;


}

export class GameMessageS2C_Operation extends GameMessageBase {
    type: GameMessageType=GameMessageType.S2C_Operation;
    uid: number;
    operations: GameMessageC2S_Operation[];

}

export class GameMessageOperationBody {
    dir: Direction;
}
