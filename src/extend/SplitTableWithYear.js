"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitTableWithYear = void 0;
class SplitTableWithYear {
    constructor(tableName) {
        this.tableName = tableName;
    }
    getTableName() {
        return `${this.tableName}_${new Date().getFullYear()}`;
    }
    queryWidthIntervalTime(start, end) {
        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);
        const tableName = [];
        for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
            tableName.push(`${this.tableName}_${year}`);
        }
        return tableName;
    }
}
exports.SplitTableWithYear = SplitTableWithYear;
