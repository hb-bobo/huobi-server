
// msg = {
//     from: ,
//     type: 'sub'.
//     value:'market.${symbol}.depth.step0'
// }
class Subscribe {
    /**
     * @param {Object} send: Function
     */
    constructor({send}) {
        this.subData= {};
        this.send = send;
    }
    /**
     * @param {WebSocket | 'server'} ws 
     * @param {Object} msg 
     */
    sub(ws, msg) {
        let subValue = msg.value;
        if (this.subData[subValue] === undefined) {
            this.subData[subValue] = {
                subscribers: [],
                id: subValue,
                symbol: msg.symbol,
                type: msg.type,
                from: msg.from,
            };
            this.send({
                [msg.type]: msg.value,
                // op: msg.type,
                topic: msg.value,
                id: this.subData[subValue].id,
            });
        }
        // 只能订阅一次
        if (!this.subData[subValue].subscribers.includes(ws) && msg.from !== 'server') {
            this.subData[subValue].subscribers.push(ws);
        } 
    }
    /**
     * @param {WebSocket | 'server'} ws 
     * @param {Object} msg 
     */
    unsub(ws, msg) {
        // 取消ws所有订阅
        if (msg === undefined) {
            for (let subValue in this.subData) {
                let item = this.subData[subValue];
                if (item && item.subscribers
                    && item.subscribers.length > 0 
                ) {
                    let index = item.subscribers.indexOf(ws);
                    if (index !== -1) {
                        item.subscribers.splice(index, 1);
                    }
                }
            }
            return;
        }
        // 取消单个订阅
        let subValue =  msg.value;
        if (this.subData[subValue] === undefined) {
            return;
        }
        if (!Array.isArray(this.subData[subValue].subscribers)) {
            return;
        }
        let wsList = this.subData[subValue].subscribers;
        
        for (let i = 0; i < wsList.length; i++) {
            let _ws = wsList[i];
            if (_ws === ws) {
                wsList.splice(i, 1);
                break;
            }
        }
        // clinet 为0时，取消对火币的订阅
        if (wsList.length === 0 && !this.subData[subValue].from.includes('server')
            || wsList.includes('server-auto-trade') && this.subData[subValue].from !== 'server'
        ) {
            this.send({
                unsub: subValue,
                op: 'unsub',
                topic: subValue,
                cid: this.subData[subValue].id,
            });
            delete  this.subData[subValue];
        }
    }
    forEach(callback) {
        for (let subValue in this.subData) {
            let item = this.subData[subValue];
            if (item.subscribers.length > 0 || item.from.includes('server')) {
                callback({
                    // op: item.type,
                    // topic: subValue,
                    [item.type]: subValue,
                    id: item.id,
                });
            }
        }
    }
}
module.exports = Subscribe;