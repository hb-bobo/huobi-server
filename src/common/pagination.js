"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOption = {
    pageSize: 10,
    current: 1,
};
function pagination({ pageSize = defaultOption.pageSize, current = 1 } = {}) {
    return {
        skip: pageSize * (current - 1),
        take: Number(pageSize),
        current: Number(current),
        pageSize: Number(pageSize),
    };
}
exports.default = pagination;
