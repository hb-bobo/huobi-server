import { SymbolInfo } from "ROOT/lib/huobi-sdk";
import { autoToFixed } from "ROOT/utils";
import { hbsdk } from "./hbsdk";
import symbolPrice from "./price";

/**
 * 缓存币的基本信息
 */
export const _SYMBOL_INFO_MAP: Record<string, SymbolInfo> = {};
/**
 * 根据symbol获取精度，base-currency, quote-currency
 * @param {string} symbol
 */
export const getSymbolInfo = async function (symbol: string) {

    if (symbol && _SYMBOL_INFO_MAP[symbol]) {
        return _SYMBOL_INFO_MAP[symbol];
    }
    const symbolsList = await hbsdk.getSymbols();
    console.log('symbolsList', Array.isArray(symbolsList))
    if (!symbolsList) {
        return;
    }
    for (let i = 0; i < symbolsList.length; i++) {
        const symbolInfo = symbolsList[i];
        _SYMBOL_INFO_MAP[`${symbolInfo['base-currency']}${symbolInfo['quote-currency']}`] = symbolInfo;
    }
    return _SYMBOL_INFO_MAP[symbol];
}


/**
 * 合并相同的价格统计次数并排序(价格为usdt)
 * @param {Array<Array<number>>} data
 */
export const getSameAmount = function (data, {
	type = '',
	symbol = '',
	sortBy = 'sumMoneny',
    priceInfo = {btc: 0, eth: 0},
    minSumPrice = 100,
    minPrice = 1000,
} = {}) {

	const countTemp: Record<number, {count: number, prices: number[]}> = {};

	// 统计重复次数
	for (let i = 0; i < data.length; i++) {
		const count = data[i][1];

		if (countTemp[count] === undefined) {
			countTemp[count] = {
				count: 1,
				prices: [data[i][0]]
			}
			continue;
		}
		countTemp[count].count += 1;
		countTemp[count].prices.push(data[i][0]);
	}
	const arr: {
		count: number;
		amount: number;
		sumCount: number
		sumMoneny: number;
		sumDollar: number;
		price: number;
		prices: number[];
	}[] = [];
	for (const key in countTemp) {
		const prices = countTemp[key].prices;
		let price = 0;
		// 多个重复则取个平均数
		if (prices.length === 1) {
			price = countTemp[key].prices[0];
		} else {
			price = prices.reduce((accumulator, item) => accumulator + item) / prices.length;
		}
		// 同数量出现 的次数
		const count = countTemp[key].count;
		// 总量 = 次数 * 单个挂单量
		const sum = count * Number(key);
		// 总价
		const sumPrice = sum * price;
		let sumDollar = sumPrice;

		// 转换成美元价格
		if (symbol.endsWith('btc')) {
			sumDollar = sumPrice * priceInfo.btc;
		} else if (symbol.endsWith('eth')) {
			sumDollar = sumPrice * priceInfo.eth;
		}
		if ((count > 1 && sumDollar > minSumPrice) //机器人
			|| (sumDollar > minPrice) // 大户
			|| count > 10 //机器人
			|| (sum % 10 === 0 && sumDollar > minSumPrice) // 10整数倍
		) {
			const data = {
				count: count,
				amount: autoToFixed(key), // 量
				sumCount: autoToFixed(sum),
				sumMoneny: autoToFixed(sumPrice),
				sumDollar: autoToFixed(sumDollar),
				price: autoToFixed(price),
				prices: countTemp[key].prices,
			}
			arr.push(data);
		}
	}
	if (type === 'asks' && sortBy === 'price') {
		return arr.sort(function (a, b) {
			return Number(a[sortBy]) - Number(b[sortBy]);
		});
	}
	return arr.sort(function (a, b) {
		return b[sortBy] - a[sortBy]
	});
}

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
export function getTop(arr, len = 3) {
    return arr.sort(function (a, b) {
        return Number(a.price) - Number(b.price);
    }).slice(0, len);
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




/**
 * 获取btc eth对usdt的系数
 * @param {string} symbol
 * @return {number}
 */
export function getPriceIndex (symbol: string) {
    // btc eth交易对转美元
    const _temp = {
        usdt: 1,
        btc: symbolPrice.get('btc'),
        eth: symbolPrice.get('eth'),
        ht: symbolPrice.get('ht'),
        husd: 1,
    }
    let _price = 0;
    for (const key in _temp) {
        if (symbol.endsWith(key)) {
            _price = _temp[key];
            break;
        }
    }
    return _price - 0;
}
