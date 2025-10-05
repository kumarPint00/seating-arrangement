"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.redis = exports.closeQueue = exports.getJobResult = exports.addDBJob = exports.dbQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
// Redis connection configuration for BullMQ
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null, // Required for BullMQ
    retryDelayOnFailover: 100,
    lazyConnect: true
};
// Create Redis connection with error handling
const redis = new ioredis_1.default(redisConfig);
exports.redis = redis;
// Handle Redis connection errors gracefully
redis.on('error', (error) => {
    logger_1.logger.warn('Redis connection failed - running without queue functionality', { error: error.message });
});
// Create job queue
exports.dbQueue = new bullmq_1.Queue('database-operations', {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
});
// Job processor
const worker = new bullmq_1.Worker('database-operations', async (job) => {
    const { userId, operation, userData } = job.data;
    logger_1.logger.info(`Processing DB operation`, {
        jobId: job.id,
        userId,
        operation,
        component: 'queue'
    });
    // Simulate database operation delay
    await new Promise(resolve => setTimeout(resolve, 200));
    // Mock database operations
    if (operation === 'fetch') {
        const mockUsers = [
            { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01T00:00:00Z' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-01-02T00:00:00Z' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2023-01-03T00:00:00Z' },
            { id: '4', name: 'Alice Brown', email: 'alice@example.com', createdAt: '2023-01-04T00:00:00Z' },
            { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', createdAt: '2023-01-05T00:00:00Z' }
        ];
        const user = mockUsers.find(u => u.id === userId) || null;
        logger_1.logger.info(`DB fetch completed`, {
            userId,
            found: !!user,
            component: 'queue'
        });
        return {
            userId,
            user,
            timestamp: Date.now()
        };
    }
    else if (operation === 'create') {
        logger_1.logger.info(`DB create completed`, {
            userId,
            component: 'queue'
        });
        return {
            userId,
            user: userData,
            timestamp: Date.now()
        };
    }
    throw new Error(`Unknown operation: ${operation}`);
}, {
    connection: redis,
    concurrency: 5 // Process up to 5 jobs concurrently
});
exports.worker = worker;
// Event listeners
worker.on('completed', (job) => {
    logger_1.logger.info(`Job completed`, {
        jobId: job.id,
        component: 'queue'
    });
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`Job failed`, {
        jobId: job?.id,
        error: err.message,
        component: 'queue'
    });
});
worker.on('error', (err) => {
    logger_1.logger.error(`Worker error`, {
        error: err.message,
        component: 'queue'
    });
});
// Queue management functions
const addDBJob = async (userId, operation, userData) => {
    const job = await exports.dbQueue.add('db-operation', {
        userId,
        operation,
        userData
    }, {
        jobId: `${operation}-${userId}-${Date.now()}`, // Unique job ID
        priority: operation === 'create' ? 10 : 5 // Prioritize creates over fetches
    });
    logger_1.logger.info(`DB job queued`, {
        jobId: job.id,
        userId,
        operation,
        component: 'queue'
    });
    return job;
};
exports.addDBJob = addDBJob;
// Get job result
const getJobResult = async (jobId) => {
    try {
        const job = await bullmq_1.Job.fromId(exports.dbQueue, jobId);
        if (job && job.finishedOn) {
            return job.returnvalue;
        }
        return null;
    }
    catch (error) {
        logger_1.logger.error(`Error getting job result`, {
            jobId,
            error: error instanceof Error ? error.message : 'Unknown error',
            component: 'queue'
        });
        return null;
    }
};
exports.getJobResult = getJobResult;
// Graceful shutdown
const closeQueue = async () => {
    logger_1.logger.info('Closing job queue and worker', { component: 'queue' });
    await worker.close();
    await exports.dbQueue.close();
    redis.disconnect();
};
exports.closeQueue = closeQueue;
// Handle process shutdown
process.on('SIGTERM', exports.closeQueue);
process.on('SIGINT', exports.closeQueue);
//# sourceMappingURL=jobQueue.js.map