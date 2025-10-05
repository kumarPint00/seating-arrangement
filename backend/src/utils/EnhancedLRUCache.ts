import { LRUCache } from 'lru-cache';
import { logger } from './logger';

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  averageResponseTime: number;
}

export class EnhancedLRUCache<T extends {}> {
  private cache: LRUCache<string, T>;
  private stats: CacheStats;
  private responseTimes: number[];
  private cleanupInterval: NodeJS.Timeout;

  constructor(capacity: number, ttlSeconds: number = 60) {
    this.cache = new LRUCache<string, T>({
      max: capacity,
      ttl: ttlSeconds * 1000, // Convert to milliseconds
    });

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      averageResponseTime: 0
    };

    this.responseTimes = [];

    // Update size periodically
    this.cleanupInterval = setInterval(() => {
      this.updateStats();
    }, 30000); // Every 30 seconds

    logger.info(`LRU Cache initialized`, {
      capacity,
      ttlSeconds,
      component: 'cache'
    });
  }

  get(key: string): T | undefined {
    const startTime = Date.now();
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      logger.debug(`Cache HIT for key: ${key}`, { key, component: 'cache' });
    } else {
      this.stats.misses++;
      logger.debug(`Cache MISS for key: ${key}`, { key, component: 'cache' });
    }

    this.recordResponseTime(Date.now() - startTime);
    return value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
    logger.debug(`Cache SET for key: ${key}`, { key, component: 'cache' });
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache DELETE for key: ${key}`, { key, component: 'cache' });
    }
    return deleted;
  }

  clear(): void {
    const sizeBeforeClear = this.cache.size;
    this.cache.clear();
    this.responseTimes = [];
    logger.info(`Cache cleared`, { 
      entriesRemoved: sizeBeforeClear,
      component: 'cache' 
    });
  }

  getStats(): CacheStats {
    this.updateStats();
    return {
      ...this.stats,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  size(): number {
    return this.cache.size;
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
  }

  private recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    // Keep only last 100 response times for average calculation
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.responseTimes.length) * 100) / 100;
  }

  // Cleanup method for graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    logger.info('Cache destroyed', { component: 'cache' });
  }
}