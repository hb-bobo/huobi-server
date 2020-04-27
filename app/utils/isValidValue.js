
/**
 * 是否有效值(不支持object, 建议用lodash.isEmpty)
 * @param {any} val
 * @return { boolean }
 */
const isValidValue = function (val) {
    if (
        val === undefined
        || val === null
        || (typeof val === 'string' && val.trim() === '')
    ) {
        return false;
    }
    return true;
}
module.exports = isValidValue;