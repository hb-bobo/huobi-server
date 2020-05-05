
export enum SocketFrom {
    client = 'clinet',
    server = 'server',
    huobi = 'huobi',
}

export interface SocketMessage<T = any> {
    type: string;
    from: SocketFrom;
    data: T;
}