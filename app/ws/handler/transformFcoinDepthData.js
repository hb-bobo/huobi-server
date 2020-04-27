

function transformFcoinDepthData (data, type) {
    let res = [];
    if (!Array.isArray(data)) {
        return;
    }
    for (let index = 0; index < data.length; index += 2) {
        const price = data[index];
        const amount = data[index + 1];
        res.push([price, amount])
    }
    return res;
}
module.exports = transformFcoinDepthData;