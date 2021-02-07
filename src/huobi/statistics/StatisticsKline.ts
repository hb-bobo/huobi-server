import Emitter from 'events';
import isEmpty from 'lodash/isEmpty';
import { errLogger } from 'ROOT/common/logger';
import { autoToFixed } from 'ROOT/utils';
import { mergeTime, Period } from '../mergeTime';


export default class StatisticsKline extends Emitter{
    mergeHandler: ReturnType<typeof mergeTime>;
    mergeData?: Record<string, any>;
    constructor(disTime: Period) {
        super();
        this.mergeHandler = mergeTime(() => {
            this.emit('merge', this.mergeData);
            this.mergeData = undefined;
        }, disTime);
    }
    merge(data) {
        if (!this.mergeData) {
            this.mergeData = data;
        } else {
            this.mergeData = data;
        }
        this.mergeHandler();
    }
}
