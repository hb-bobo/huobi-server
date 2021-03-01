"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const start_1 = require("../../huobi/start");
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
            console.log(start_1.trader.orderConfigMap[symbol].quant.analyser.result);
            symbolsData[symbol] = start_1.trader.orderConfigMap[symbol].quant.analyser.result;
        });
        ctx.sendSuccess({
            data: symbolsData
        });
    }
    catch (error) {
        ctx.sendError({ message: error });
    }
};
