export interface Advert {
    title: string;
    download: string;
    // status: 'normal' | 'exception' | 'active' | 'success';
    percent: number;
    cover: string;
    updatedAt?: number;
    createdAt: number;
    onlineDate: [number, number];
    subDescription: string;
    activeUser: string;
    online: boolean; // 是否上线
}