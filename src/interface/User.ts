export interface User {
    user: string;
    password: string;
    /**
     * 0 admin
     * 1 user
     */
    role: 0 | 1;
}