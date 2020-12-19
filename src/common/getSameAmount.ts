import { getSymbolInfo } from "./getSymbolInfo";
import { toNumber } from "lodash";
import { keepDecimalFixed } from "ROOT/utils";



let config = {
	sortBy: 'sumMoneny',
	// 有多单时， 总和超过最小价，低于则不显示
	minSumPrice: 100,
	// 1单时， 总和超过最小价，低于则不显示
	minPrice: 1000,
}
/**
 * 
 * @param {Object} newConfig 
 */
export function setConfig(newConfig) {
	Object.assign(config, newConfig);
}

/**
 * 合并相同的价格统计次数并排序
 * @param {Array<Array<number>>} data
 */
export const getSameAmount = function (data, {
	type = '',
	symbol = '',
	sortBy = config.sortBy,
	priceInfo = {btc: 0, eth: 0},
} = {}) {
	// data = data.slice(0, 400)
	let countTemp: Record<number, {count: number, prices: number[]}> = {};
	// 拿价格，量的小数位
	let symbolInfo = getSymbolInfo(symbol);
	let amountPrecision = symbolInfo['amount-precision'];
	let pricePrecision = symbolInfo['price-precision'];
	// 统计重复次数
	for (let i = 0; i < data.length; i++) {
		let count = data[i][1];

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
	let arr: {
		count: number;
		amount: number;
		sumCount: number
		sumMoneny: number;
		sumDollar: number;
		price: number;
		prices: number[];
	}[] = [];
	for (let key in countTemp) {
		let prices = countTemp[key].prices;
		let price = 0;
		// 多个重复则取个平均数
		if (prices.length === 1) {
			price = countTemp[key].prices[0];
		} else {
			price = prices.reduce((accumulator, item) => accumulator + item) / prices.length;
		}
		// 同数量出现 的次数
		let count = countTemp[key].count;
		// 总量 = 次数 * 单个挂单量
		let sum = count * Number(key);
		// 总价
		let sumPrice = sum * price;
		let sumDollar = sumPrice;
		
		// 转换成美元价格
		if (symbol.endsWith('btc')) {
			sumDollar = sumPrice * priceInfo.btc;
		} else if (symbol.endsWith('eth')) {
			sumDollar = sumPrice * priceInfo.eth;
		}
		if ((count > 1 && sumDollar > config.minSumPrice) //机器人
			|| (sumDollar > config.minPrice) // 大户
			|| count > 10 //机器人
			|| (sum % 10 === 0 && sumDollar > config.minSumPrice) // 10整数倍
		) {
			let data = {
				count: count,
				amount: keepDecimalFixed(key, amountPrecision), // 量
				sumCount: keepDecimalFixed(sum, amountPrecision),
				sumMoneny: keepDecimalFixed(sumPrice, 2),
				sumDollar: keepDecimalFixed(sumDollar, 2),
				price: keepDecimalFixed(price, pricePrecision),
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


// export default getSameAmount;
