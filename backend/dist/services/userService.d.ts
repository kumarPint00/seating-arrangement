export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}
export declare const simulateDBCall: (userId: string) => Promise<User | null>;
export declare const saveUser: (user: User) => Promise<User>;
//# sourceMappingURL=userService.d.ts.map