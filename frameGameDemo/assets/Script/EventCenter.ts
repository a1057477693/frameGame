/**
 * 观察者模式
 */
export default class EventCenter {
    private static events: Map<string, Array<EventHandler>> = new Map<string, Array<EventHandler>>();

    //注册
    static registerEvent(eventName: string, callBack: Function, targer: object): void {
        if (eventName == undefined || callBack == undefined || targer == undefined) {
            throw Error("register event error");
        }
        if (EventCenter.events[eventName] == undefined) {
            EventCenter.events[eventName] = new Array<EventHandler>();
        }
        let handler = new EventHandler(targer, callBack);

        EventCenter.events[eventName].push(handler);
    }

    //请求
    static postEvent(eventName: string, param?: any): void {
        let handlers = EventCenter.events[eventName];
        if (handlers == undefined) {
            return;
        }
        //console.log("post event", eventName);
        for (let i = 0; i < handlers.length; i++) {
            let handler = handlers[i];
            if (handler) {
                try {
                    handler.function.call(handler.target, param);
                } catch (e) {
                    console.log(e.message);
                    console.log(e.stack.toString());
                }
            }
        }
    }

    //销毁
    static removeEvent(eventName: string, callBack: Function, targer: object): void {
        let handlers = EventCenter.events[eventName];
        if (handlers == undefined) {
            return;
        }
        console.log("remove event", eventName);
        for (let i = 0; i < handlers.length; i++) {
            let handler = handlers[i];
            if (handler != undefined && handler.target == targer && handler.function == callBack) {
                //handler.splice(i, 1);//这个效率低，但是占用空间小
                handler[i] = undefined;//这个效率高，但是占用空间大
            }
        }
    }


}

class EventHandler {
    target: object;
    function: Function;

    constructor(tar: object, func: Function) {
        this.target = tar;
        this.function = func;
    }
}
