
import config from 'config';
import schema from 'async-validator';
import { AppContext } from 'ROOT/interface/App';

import { trader } from 'ROOT/huobi/start';
import { pick } from 'lodash';
import dayjs from 'dayjs';

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
                const { result } = trader.orderConfigMap[symbol].quant.analyser;
                symbolsData[symbol] = result.map((item) => {
                    const time = dayjs(item.time).utcOffset(8).format('YYYY-MM-DD H:mm:ss');
                    return {
                        ...item,
                        time
                    }
                });
            });
            ctx.sendSuccess({
                data: symbolsData
            });
        } catch (error) {
            ctx.sendError({message: error});
        }
    }

}


