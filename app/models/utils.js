
/**
 * 返回带年份的table表
 * @param {string} tableName 
 */
const getYearTable = function (tableName) {
    return `${tableName}_${(new Date()).getFullYear()}`;
}
exports.getYearTable = getYearTable;



/**
 * object to stirng
 * @param {object}
 * @return {string}
 */
const toWhereString = function (object) {
    let where = [];
    let whereQuery = '';
    for(let key in object) {
        if (object[key] || object[key] === 0) {
            where.push(`\`${key}\` = '${object[key]}'`);
        }
    }
    if (where.length > 0) {
        whereQuery = `WHERE ${where.join(' AND ')}`;
    }
    return whereQuery;
}
exports.toWhereString = toWhereString;

/**
 * object to stirng
 * @param {object}
 * @return {string}
 */
const toSetString = function (object) {
    let set = [];
    let setQuery = '';
    for(let key in object) {
        if (object[key] || object[key] === 0) {
            set.push(`\`${key}\` = '${object[key]}'`);
        }
        // set.push(`\`${key}\`='${object[key]}'`);
    }
    if (set.length > 0) {
        setQuery = `SET ${set.join(',')}`;;
    }
    return setQuery;
}
exports.toSetString = toSetString;