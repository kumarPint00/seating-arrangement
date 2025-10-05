interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    averageResponseTime: number;
}
export declare class LRUCache<T> {
    private capacity;
    private cache;
    private head?;
    private tail?;
    private ttl;
    private stats;
    private responseTimes;
    private cleanupInterval;
    constructor(capacity: number, ttlSeconds?: number);
    get(key: string): T | null;
    set(key: string, value: T): void;
    delete(key: string): boolean;
    clear(): void;
    getStats(): CacheStats;
    private moveToHead;
    private addToHead;
    private removeNode;
    private removeTail;
    private cleanupExpired;
    private recordResponseTime;
    private calculateAverageResponseTime;
    destroy(): void;
}
export {};
//# sourceMappingURL=LRUCache.d.ts.map