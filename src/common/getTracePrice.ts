import { autoToFixed } from "ROOT/utils";



/**
 *  amount:"141940.65"
    count:1
    price:"0.00018500"
    prices:Array[1]
    sumCount:"141940.65"
    sumDollar:"172469.25"
    sumMoneny:"26.26" 
 * @param {object[]} arr 
 * @param {number} len 
 */
function getTop(arr, len = 3) {
    return arr.slice(0, len)
    .sort(function (a, b) {
        return Number(a.price) - Number(b.price);
    });
}


/**
 * 
 * 根据买卖压力推荐价格
 */
export const getTracePrice = function ({
    bidsList,
    asksList,
}) {
    /* 交易数据 */
    const prices = {
        sell: [] as number[],
        buy: [] as number[],
    }; 

    const newBidsList = getTop(bidsList);
    const newAsksList = getTop(asksList);

    // 重复则取第一个作为备用
    newBidsList.forEach(item => {
        prices.buy.push(Number(item.price));
    });
    newAsksList.forEach(item => {
        prices.sell.push(Number(item.price));
    });
    // 取机器人的价格
    const robotBids = bidsList.filter(item => item.count > 1).sort(function (a, b) {
        return b.count - a.count;
    });
    const robotAsks = asksList.filter(item => item.count > 1).sort(function (a, b) {
        return b.count - a.count;
    });
    if (robotBids.length > 0) {
        if (!prices.buy.includes(Number(robotBids[0].price))) {
            prices.buy.push(Number(robotBids[0].price));
        }
    }
    if (robotAsks.length > 0) {
        if (!prices.sell.includes(Number(robotAsks[0].price))) {
            prices.sell.push(Number(robotAsks[0].price));
        }
    }
    // 添加备用单
    prices.buy.push(
        Number(autoToFixed(Math.min(...prices.buy) *  (1 - 0.008)))
    );
    prices.sell.push(
        Number(autoToFixed(Math.max(...prices.sell) *  (1 + 0.008)))
    );
    return prices;
}

