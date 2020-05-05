
/**
 * 是否有效值(不支持object, 建议用lodash.isEmpty)
 * @param {any} val
 * @return { boolean }
 */
export const isValidValue = function (val: any) {
    if (
        val === undefined
        || val === null
        || (typeof val === 'string' && val.trim() === '')
    ) {
        return false;
    }
    return true;
}

/**
 * 是否url link
 * @param {string} val
 * @return { boolean }
 */
export const isUrl = function (val: any) {
    const reg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/;
    if (reg.test(val)) {
        return true;
    }
    return false;
}



export const isEmail = function (val: any) {
    const reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
    if (reg.test(val)) {
        return true;
    }
    return false;
}