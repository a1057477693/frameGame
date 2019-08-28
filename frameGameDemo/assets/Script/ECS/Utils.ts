import Component from "./Component";

export function convertComponentTypeIdToIndex(typeId: number): number {

    let pos = 0;
    if ((typeId & 0xFFFF) == 0) {
        typeId >>= 16;
        pos += 16;
    }
    if ((typeId & 0xFF) == 0) {
        typeId >>= 8;
        pos += 8;
    }
    if ((typeId & 0xF) == 0) {
        typeId >>= 4;
        pos += 4;
    }
    if ((typeId & 0x3) == 0) {
        typeId >>= 2;
        pos += 2;
    }
    if ((typeId & 0x1) == 0) {
        pos += 1;
    }

    return pos;
}

/**
 *
 * @param {{prototype: Component}[]} types
 * @returns {number}
 */
export function getCompontsProtoBits(types: { prototype: Component }[]): number {
    let bits = 0;
    for (let i = 0; i < types.length; i++) {
        let type = types[i];
        bits |= type.prototype.type;

    }
    return bits;
}

/**
 * 判断包含
 * @param {number} subBits
 * @param {number} allBits
 * @returns {boolean}
 */
export function isContainSubBit(subBits: number, allBits: number): boolean {

    return subBits == (subBits & allBits);

}

export function deepClone(obj: object, result?: object): object {
    if (!result) {
        result = {};
    }
    let key = null;
    if (obj && typeof obj === 'object') {
        for (key in obj) {
            if (obj[key] && typeof  obj[key] === 'object') {
                result[key] = deepClone(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    }
    return obj;

}