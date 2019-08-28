import GameActor from "./UI/GameActor";
import GameStatusActorBase from "./GameStatus";

/**
 * 状态机
 */
export default class GameStatusMachine {

    actor: GameActor;

    currStartus: GameStatusActorBase = null;

    constructor(actor: GameActor) {
        this.actor = actor;
    }

    changeStatus(status: GameStatusActorBase) {
        if (this.currStartus) {
            this.currStartus.onExitStatus();
        }
        this.currStartus = status;
        this.currStartus.machine = this;
        this.currStartus.onEnterStatus();
    }

    update(dt: number) {
        if (this.currStartus) {
            this.currStartus.update(dt);
        }
    }
}