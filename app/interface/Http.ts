
export interface ResponseBody<T extends any> {
    code: number;
    message: string;
    status: 'ok' | 'error';
    data?: T;
    [key: string]: any;
}
