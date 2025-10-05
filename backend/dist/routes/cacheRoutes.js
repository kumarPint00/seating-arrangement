"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheRoutes = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const logger_1 = require("../utils/logger");
exports.cacheRoutes = (0, express_1.Router)();
// DELETE /cache - Clear all cache
exports.cacheRoutes.delete('/', (req, res, next) => {
    try {
        const statsBefore = index_1.cache.getStats();
        index_1.cache.clear();
        const statsAfter = index_1.cache.getStats();
        logger_1.logger.info('Cache manually cleared', {
            entriesRemoved: statsBefore.size,
            component: 'cache-routes'
        });
        res.json({
            message: 'Cache cleared successfully',
            entriesRemoved: statsBefore.size,
            currentSize: statsAfter.size
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /cache-status - Get cache statistics
exports.cacheRoutes.get('-status', (req, res, next) => {
    try {
        const stats = index_1.cache.getStats();
        // Calculate hit ratio
        const totalRequests = stats.hits + stats.misses;
        const hitRatio = totalRequests > 0 ? (stats.hits / totalRequests * 100).toFixed(2) : '0.00';
        res.json({
            ...stats,
            hitRatio: `${hitRatio}%`,
            totalRequests,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=cacheRoutes.js.map