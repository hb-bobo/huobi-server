/**
 * 表单验证的错误信息
 */
export interface ValidateError {
    message: string;
    field: string;
}
/**
 * 表单验证的错误列表
 */
export type ErrorList = ValidateError[];

export enum ResponseCodeType {
    success = 0,
    /** 表单错误 */
    formError = 10,
    /** 未知错误 */
    otherError = 30,
    /** 权限错误 */
    authorizationError = 401,
}
export interface SuccessResponseBody<T extends any = any> {
    code: number;
    message: string;
    status: 'ok';
    data?: T;
}

export interface ErrorResponseBody<T = ErrorList> {
    code: number;
    status: 'error';
    message: string;
    /**
     * 表单验证的错误列表
     */
    errors: T;
}
