import GameStatusMachine from "./GameStatusMachine";
import GameUtils from "./GameUtils";

/**
 * Actor的状态父类
 */
export default class GameStatusActorBase {

    status: GameStatusType = GameStatusType.None;
    machine: GameStatusMachine = null;
    statusTime: number = 0;

    onEnterStatus() {

    }

    onExitStatus() {
        this.machine = null;
    }

    update(dt: number) {
        this.statusTime += dt;
    }
}

//闲置状态
export class GameStatusIdle extends GameStatusActorBase {
    status: GameStatusType = GameStatusType.Idle;

    update(dt: number) {
        super.update(dt);

        let percent = (this.statusTime / this.machine.actor.animIdleTotalTime) % 1;
        let spriteFrames = this.machine.actor.sfIdle;
        GameUtils.preferAnimFrame(this.machine.actor.spActor, spriteFrames, percent);
    }
}

//行走状态
export class GameStatusWalk extends GameStatusActorBase {
    status: GameStatusType = GameStatusType.Walk;

    update(dt: number) {
        super.update(dt);

        let percent = (this.statusTime / this.machine.actor.animWalkTotalTime) % 1;
        let spriteFrames = this.machine.actor.sfWalk;
        GameUtils.preferAnimFrame(this.machine.actor.spActor, spriteFrames, percent);

        if (this.machine.actor.moveComponent.speedX > 0) {
            this.machine.actor.node.scaleX = 1;
        } else if (this.machine.actor.moveComponent.speedX < 0) {
            this.machine.actor.node.scaleX = -1;
        }
    }
}

//开火状态
export class GameStatusFire extends GameStatusActorBase {
    status: GameStatusType = GameStatusType.Fire;

    update(dt: number) {
        super.update(dt);

        let percent = (this.machine.actor.fireComponent.currentFrame / this.machine.actor.fireComponent.totalFireFrame) % 1;
        let spriteFrames = this.machine.actor.sfFire;
        GameUtils.preferAnimFrame(this.machine.actor.spActor, spriteFrames, percent);

        if (this.machine.actor.moveComponent.speedX > 0) {
            this.machine.actor.node.scaleX = 1;
        } else if (this.machine.actor.moveComponent.speedX < 0) {
            this.machine.actor.node.scaleX = -1;
        }
    }
}

//死亡状态
export class  GameStatusDie extends GameStatusActorBase {
    status: GameStatusType = GameStatusType.Die;

    update(dt: number) {
        super.update(dt);
        let percent = Math.min(0.999, (this.statusTime / this.machine.actor.animDieTotalTime));
        let spriteFrames = this.machine.actor.sfDie;
        GameUtils.preferAnimFrame(this.machine.actor.spActor, spriteFrames, percent);
    }
}

export enum GameStatusType {
    None,
    Idle,
    Walk,
    Fire,
    Die,
}