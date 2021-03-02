"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const start_1 = require("../../huobi/start");
const dayjs_1 = __importDefault(require("dayjs"));
class StatisticsController {
}
exports.default = StatisticsController;
StatisticsController.index = async (ctx) => {
    // const {  } = ctx.request.query;
    const userId = ctx.state.user && ctx.state.user.id;
    try {
        // if (!trader.orderConfigMap[symbol as string]) {
        //     ctx.sendError({message: `${symbol} 不存在`});
        //     return;
        // }
        const symbols = Object.keys(start_1.trader.orderConfigMap);
        const symbolsData = {};
        symbols.forEach(symbol => {
            const { result } = start_1.trader.orderConfigMap[symbol].quant.analyser;
            symbolsData[symbol] = result.map((item) => {
                const time = dayjs_1.default(item.time).utcOffset(8).format('YYYY-MM-DD H:mm:ss');
                return {
                    ...item,
                    time
                };
            });
        });
        ctx.sendSuccess({
            data: symbolsData
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
