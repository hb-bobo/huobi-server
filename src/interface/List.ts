export interface ListResult<T> {
    list: T[];
    pagination: Pagination & {total: number;};
}

export interface Pagination {
    pageSize: number;
    current: number;
};