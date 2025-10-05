"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedLRUCache = void 0;
const lru_cache_1 = require("lru-cache");
const logger_1 = require("./logger");
class EnhancedLRUCache {
    constructor(capacity, ttlSeconds = 60) {
        this.cache = new lru_cache_1.LRUCache({
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
        logger_1.logger.info(`LRU Cache initialized`, {
            capacity,
            ttlSeconds,
            component: 'cache'
        });
    }
    get(key) {
        const startTime = Date.now();
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.stats.hits++;
            logger_1.logger.debug(`Cache HIT for key: ${key}`, { key, component: 'cache' });
        }
        else {
            this.stats.misses++;
            logger_1.logger.debug(`Cache MISS for key: ${key}`, { key, component: 'cache' });
        }
        this.recordResponseTime(Date.now() - startTime);
        return value;
    }
    set(key, value) {
        this.cache.set(key, value);
        logger_1.logger.debug(`Cache SET for key: ${key}`, { key, component: 'cache' });
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            logger_1.logger.debug(`Cache DELETE for key: ${key}`, { key, component: 'cache' });
        }
        return deleted;
    }
    clear() {
        const sizeBeforeClear = this.cache.size;
        this.cache.clear();
        this.responseTimes = [];
        logger_1.logger.info(`Cache cleared`, {
            entriesRemoved: sizeBeforeClear,
            component: 'cache'
        });
    }
    getStats() {
        this.updateStats();
        return {
            ...this.stats,
            averageResponseTime: this.calculateAverageResponseTime()
        };
    }
    size() {
        return this.cache.size;
    }
    updateStats() {
        this.stats.size = this.cache.size;
    }
    recordResponseTime(time) {
        this.responseTimes.push(time);
        // Keep only last 100 response times for average calculation
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift();
        }
    }
    calculateAverageResponseTime() {
        if (this.responseTimes.length === 0)
            return 0;
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        return Math.round((sum / this.responseTimes.length) * 100) / 100;
    }
    // Cleanup method for graceful shutdown
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
        logger_1.logger.info('Cache destroyed', { component: 'cache' });
    }
}
exports.EnhancedLRUCache = EnhancedLRUCache;
//# sourceMappingURL=EnhancedLRUCache.js.map