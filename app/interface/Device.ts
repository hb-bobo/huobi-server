import { ObjectId } from "bson";

export interface Device {
    _id: any;
    name: string;
    ip: string;
    address: string; // 详细地址
    location: string; // 坐标点
    status: DeviceStatus; // 状态
    lastUpdater: string; // 最近一次更新人
    lastResponsesTime: number; // 最近一次回复时间
    screenshot: string; // 截屏url
    group: number; // 组
}
export interface DeviceTag{
    _id: any;
    name: string;
}

export type DeviceStatus = 0 | 10 | 11; // 0 关机, 10开机, 11异常