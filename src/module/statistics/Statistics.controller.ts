
import config from 'config';
import schema from 'async-validator';
import { AppContext } from 'ROOT/interface/App';

import { trader } from 'ROOT/huobi/start';
import { pick } from 'lodash';

export default class StatisticsController {
    public static index = async (ctx: AppContext) => {
        // const {  } = ctx.request.query;
        const userId = ctx.state.user && ctx.state.user.id;
        try {

            // if (!trader.orderConfigMap[symbol as string]) {
            //     ctx.sendError({message: `${symbol} 不存在`});
            //     return;
            // }
            const symbols = Object.keys(trader.orderConfigMap);
            const symbolsData = {};
            symbols.forEach(symbol => {
                console.log(trader.orderConfigMap[symbol].quant.analyser.result)
                symbolsData[symbol] = trader.orderConfigMap[symbol].quant.analyser.result;
            });
            ctx.sendSuccess({
                data: symbolsData
            });
        } catch (error) {
            ctx.sendError({message: error});
        }
    }

}


