import { readFile } from 'fs';
import { join } from 'path';
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
    console.log(quant.result)
}

run();
