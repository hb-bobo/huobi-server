"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseCodeType = void 0;
var ResponseCodeType;
(function (ResponseCodeType) {
    ResponseCodeType[ResponseCodeType["success"] = 0] = "success";
    /** 表单错误 */
    ResponseCodeType[ResponseCodeType["formError"] = 10] = "formError";
    /** 未知错误 */
    ResponseCodeType[ResponseCodeType["otherError"] = 30] = "otherError";
    /** 权限错误 */
    ResponseCodeType[ResponseCodeType["authorizationError"] = 401] = "authorizationError";
})(ResponseCodeType = exports.ResponseCodeType || (exports.ResponseCodeType = {}));
