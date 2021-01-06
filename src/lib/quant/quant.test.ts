import { readFile } from 'fs';
import { join } from 'path';
import xlsx from 'xlsx';
import config from 'config';
import { Quant } from ".";
import { promisify } from 'util';

const readFilePromisify = promisify(readFile);
const publicPath = config.get<string>('publicPath');

const filePath = join(publicPath, '/download/history-data/btcusdt-5min-2021-01-06.json');

async function run () {
    const data = await readFilePromisify(filePath, {encoding: 'utf-8'})

    const quant = new Quant()
    quant.analysis(JSON.parse(data))

    const sheet = xlsx.utils.json_to_sheet(quant.result);
    const workbook = { //定义操作文档
        SheetNames:['nodejs-sheetname'], //定义表明
        Sheets:{
            'nodejs-sheetname': sheet //表对象[注意表明]
        },
    }
    
    xlsx.writeFile(workbook, join(publicPath, '/download/btcusdt-5min-2021-01-06.xlsx')); //将数据写入文件
}

run();
