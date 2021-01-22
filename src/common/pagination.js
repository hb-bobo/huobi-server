"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOption = {
    pageSize: 10,
    current: 1,
};
function pagination({ pageSize = defaultOption.pageSize, current = 1 } = {}) {
    return {
        skip: pageSize * (current - 1),
        take: pageSize,
        current: current,
        pageSize: pageSize,
    };
}
exports.default = pagination;
