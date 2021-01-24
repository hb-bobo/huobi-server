import { Pagination } from "ROOT/interface/List";

const defaultOption = {
    pageSize: 10,
    current: 1,
}
export default function pagination({
    pageSize = defaultOption.pageSize,
    current = 1
}: Pagination = {} as Pagination) {
    return {
        skip: pageSize * (current - 1),
        take: pageSize,
        current: current,
        pageSize: pageSize,
    }
}