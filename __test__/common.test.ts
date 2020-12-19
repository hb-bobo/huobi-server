import { SplitTableWithYear } from "ROOT/common/SplitTableWithYear";

test('SplitTableWithYear', () => {
    const sty = new SplitTableWithYear('测试')
    expect(sty.getTableName()).toBe(`测试_${new Date().getFullYear()}`);


    const tableNames = sty.queryWidthIntervalTime('2020/12/19', '2021/1/19')

    expect(tableNames).toEqual(['测试_2020', '测试_2021']);
});
