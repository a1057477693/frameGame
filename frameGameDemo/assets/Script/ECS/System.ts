import {SystemType} from "./ECSConfig";
import {World} from "./World";

export interface  System {

    world: World;

    type: SystemType;

    onUpdate(): void;
}