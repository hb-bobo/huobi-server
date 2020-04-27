const moment = require('moment');
const WebSocket = require('ws');
const pako = require('pako');
const CryptoJS = require ('crypto-js')
const config = require('config')

const WS_URL = config.hosts.huobi_ws;
const host = " api.huobi.br.com"; // api.huobi.br.com
const uri = "/ws/v1"

/**
 * 签名计算
 * @param method
 * @param host
 * @param path
 * @param data
 * @returns {*|string}
 */
function sign_sha(method, host, path, data) {
    var pars = [];

    //将参数值 encode
    for (let item in data) {
        pars.push(item + "=" + encodeURIComponent(data[item]));
    }

    //排序 并加入&连接
    var p = pars.sort().join("&");

    // 在method, host, path 后加入\n
    var meta = [method, host, path, p].join('\n');
    //用HmacSHA256 进行加密
    var hash = CryptoJS.HmacSHA256(meta, config.huobi.secretkey);
    
    // 按Base64 编码 字符串
    var Signature = CryptoJS.enc.Base64.stringify(hash);
    // console.log(p);
    return Signature;
}

/**
 * 发送unsub
 * @param ws
 */
function unsub(ws) {
    var data ={
        op:"unsub",
        cid:"111",
        topic:"accounts"

    }

    ws.send(JSON.stringify(data));

}

/**
 * 发送sub
 * @param ws
 */
function sub(ws) {

    var data ={
        op:"sub",
        cid:"111",
        topic:"accounts"

    }

    ws.send(JSON.stringify(data));

}

/**
 * 发送req
 * @param ws
 */
function req(ws) {

    var data ={
        op:"req",
        cid:"111",
        topic:"orders.list"
    }

    ws.send(JSON.stringify(data));
}

/**
 * 发送auth请求
 * @param ws
 */
function auth(ws) {

    const timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss');

    var data = {
        AccessKeyId: config.huobi.access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: "2",
        Timestamp: timestamp,
    }
    //计算签名
    data["Signature"] = sign_sha('GET', host, uri, data);
    data["op"]="auth";
    ws.send(JSON.stringify(data));
}


function init() {
    var ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('open');
        // console.log(new Date('2019-01-01'))
        // auth(ws);
        // sub(ws)
        // ws.send(JSON.stringify({
        //     "req": "market.ethusdt.kline.5min",
        //     "id": "id generated by client",
        //     "from": new Date('2019-01-01').getTime(), //optional, type: long, 2017-07-28T00:00:00+08:00 至 2050-01-01T00:00:00+08:00 之间的时间点，单位：秒
        //     "to": new Date(('2019-04-26')).getTime() //optional,
        // }));
    });
    ws.on('message', (data) => {
        let text = pako.inflate(data, {
            to: 'string'
        });

        let msg = JSON.parse(text);

        if (  msg["err-code"] && msg["err-code"] !=0 ) {
            //TODO 发生错误，可进行自定义处理
            console.error(msg);
        }

        if (msg.op=="auth"){
            console.log(msg)
            sub(ws);//TODO  发送sub请求
        }else if (msg.op == "ping") {

            var pong ={
                op: "pong",
                ts: msg.ts
            };
            console.log(msg);
            console.log(pong);
            // 维持 ping pong
            ws.send(JSON.stringify(pong));
        }else if (msg.op == "notify"){
            // TODO 接收信息 进行业务处理
            console.log(msg)
        }else {
            console.log(msg)
        }

    });
    ws.on('close', () => {
        // websocket连接关闭处理
        console.log('close');
        init();
    });

    ws.on('error', err => {
        // websocket连接关闭处理
        console.log('error', err);
        init();
    });
}
// init();