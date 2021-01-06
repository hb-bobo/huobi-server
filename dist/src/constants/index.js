"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHORITY = exports.DEVICE = exports.DEFAULT_PAGE_SIZE = void 0;
exports.DEFAULT_PAGE_SIZE = 10;
exports.DEVICE = {
    status: {
        '0': '关机',
        '10': '正常',
        '11': '异常',
    }
};
/**
 * role type
 */
exports.AUTHORITY = {
    'admin': 0,
    'user': 1,
};
