/**
 * 工具类
 */
export default class GameUtils {

    /**
     * 帧动画播放
     * @param {cc.Sprite} sprite
     * @param {cc.SpriteFrame[]} frames
     * @param {number} percent
     * @returns {cc.SpriteFrame}
     */
    static preferAnimFrame(sprite: cc.Sprite, frames: cc.SpriteFrame[], percent: number): cc.SpriteFrame {
        sprite.spriteFrame = frames[Math.floor(frames.length * percent)];
        return sprite.spriteFrame;
    }

    static randomSeed: number = 43791;//随机种子，这里一般是服务器下发，这里我们写死
    /**
     * 随机数的算法
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static random(min: number, max: number): number {
        //这里的数值都是随意定 9301 4927 233280
        this.randomSeed = (this.randomSeed * 9301 + 4927) % 233280;
        let rnd = this.randomSeed / 233280.0;
        return min + rnd * (max - min);
    }

    /**
     * 角度装换为cc.Vec2 向量
     * @param {number} angle
     * @returns {cc.Vec2}
     */
    static angleToVector(angle: number): cc.Vec2 {

        return cc.v2(Math.cos(cc.misc.degreesToRadians(angle)), Math.sin(cc.misc.degreesToRadians(angle)));
    }


}