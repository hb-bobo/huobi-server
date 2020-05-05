export interface ListResult<T> {
    list: T[];
    pagination: {
        total: number;
        pageSize: number;
        current: number;
    };
}