import Component from "./Component";
import {convertComponentTypeIdToIndex, deepClone, isContainSubBit} from "./Utils";
import {World} from "./World";
import {EntityType} from "./ECSConfig";


export class Entity {


    compontBits: number = 0;

    componts: Component[] = [];   //保存所有的Component

    backupedComponents: Component[] = [];//保存所有需要备份的Component

    id: number = 0;

    type: EntityType = 0;   //Entity类型

    componentsDirty: boolean = false;  //标记当前component是否是脏的

    oldBits: number = 0;

    destoyed: boolean = false;//是否销毁了

    addCompont<T extends Component>(type: { new(): T }): T {
        let oldBits = this.compontBits;

        let compn = new type();

        this.componts[convertComponentTypeIdToIndex(compn.type)] = compn;

        this.compontBits |= compn.type;

        this.markComponentDirty(oldBits);
        return compn;
    }

    getCompont<T extends Component>(type: { prototype: T }): T {
        return this.componts[convertComponentTypeIdToIndex(type.prototype.type)] as T;
    }

    getBackupedComponent<T extends Component>(type: { prototype: T }): T {
        return this.backupedComponents[convertComponentTypeIdToIndex(type.prototype.type)] as T;
    }

    hasComponent<T extends Component>(type: { prototype: T }): boolean {
        return (this.compontBits & type.prototype.type) != 0;
    }

    hasComponentBits(bits: number) {
        return isContainSubBit(bits, this.compontBits);
    }

    removeComponent<T extends Component>(type: { prototype: T }) {
        let oldBits = this.compontBits;
        this.componts[convertComponentTypeIdToIndex(type.prototype.type)] = undefined;
        this.compontBits &= ~type.prototype.type;
        this.markComponentDirty(oldBits);

    }


    getCompontsByIndex(indexs: number[]): Component[] {
        let compnArr: Component[] = [];
        for (let i = 0; i < indexs.length; i++) {
            let index = indexs[i];
            compnArr.push(this.componts[index]);
        }
        return compnArr;
    }

    /**
     * 脏标记
     * @param {number} oldBits
     */
    markComponentDirty(oldBits: number) {
        if (!this.componentsDirty) {
            this.oldBits = oldBits;

            World.getInstance().notifyEntityComponentsDirty(this);
            this.componentsDirty = true;
        }

    }

    /**
     * 取消标记
     */
    cancleDirty() {
        this.componentsDirty = false;
    }

    /**
     * 备份自己所有的componet
     */
    backupComponents() {
        for (let i = 0; i < this.componts.length; i++) {
            let component = this.componts[i];
            if (!component || !component.needBackUp) {
                continue;
            }
            this.backupedComponents[i] = deepClone(component, this.backupedComponents[i]) as Component;
        }

    }

    /**
     * 使用脏标记的方法销毁Entity
     */
    maskDestoyed() {
        if (!this.destoyed) {
            World.getInstance().notifyEntityDestoryed(this);
            this.destoyed = true;
        }
    }


}