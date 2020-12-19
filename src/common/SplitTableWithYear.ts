


export class SplitTableWithYear {
    tableName!: string;
    constructor(tableName: string) {
        this.tableName = tableName;
    }
    getTableName() {
        return `${this.tableName}_${new Date().getFullYear()}`;
    }
    queryWidthIntervalTime(start: Date | string, end: Date | string) {
        const startDate = start instanceof Date ? start :  new Date(start);
        const endDate = end instanceof Date ? end :  new Date(end);
        const tableName: string[] = []

        for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
            tableName.push(`${this.tableName}_${year}`);
        }
        return tableName;
    }
}
