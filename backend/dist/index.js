"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.cache = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const userRoutes_1 = require("./routes/userRoutes");
const cacheRoutes_1 = require("./routes/cacheRoutes");
const errorHandler_1 = require("./middleware/errorHandler");
const EnhancedLRUCache_1 = require("./utils/EnhancedLRUCache");
const logger_1 = require("./utils/logger");
const jobQueue_1 = require("./utils/jobQueue");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Initialize enhanced cache instance
exports.cache = new EnhancedLRUCache_1.EnhancedLRUCache(1000, 60); // Max 1000 entries, 60s TTL
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.'
    }
});
// Burst rate limiting
const burstLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 1000, // 10 seconds
    max: 5, // 5 requests per 10 seconds
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests in burst, please slow down.'
    }
});
app.use(limiter);
app.use(burstLimiter);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Routes
app.use('/users', userRoutes_1.userRoutes);
app.use('/cache', cacheRoutes_1.cacheRoutes);
// Error handling
app.use(errorHandler_1.errorHandler);
// Graceful shutdown handling
const gracefulShutdown = async () => {
    logger_1.logger.info('Shutting down server gracefully');
    try {
        await (0, jobQueue_1.closeQueue)();
        exports.cache.destroy();
        logger_1.logger.info('Cleanup completed');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during shutdown', { error });
        process.exit(1);
    }
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Start server
const server = app.listen(PORT, () => {
    logger_1.logger.info('🚀 Event Seating API Server Started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        cacheCapacity: 1000,
        cacheTTL: '60s'
    });
});
exports.server = server;
exports.default = app;
//# sourceMappingURL=index.js.map