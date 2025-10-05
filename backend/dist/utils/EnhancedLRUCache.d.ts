interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    averageResponseTime: number;
}
export declare class EnhancedLRUCache<T extends {}> {
    private cache;
    private stats;
    private responseTimes;
    private cleanupInterval;
    constructor(capacity: number, ttlSeconds?: number);
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): boolean;
    clear(): void;
    getStats(): CacheStats;
    size(): number;
    private updateStats;
    private recordResponseTime;
    private calculateAverageResponseTime;
    destroy(): void;
}
export {};
//# sourceMappingURL=EnhancedLRUCache.d.ts.map