"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const errorHandler_1 = require("../middleware/errorHandler");
const jobQueue_1 = require("../utils/jobQueue");
const logger_1 = require("../utils/logger");
exports.userRoutes = (0, express_1.Router)();
// Concurrent request handling - track pending requests
const pendingRequests = new Map();
// GET /users/:id
exports.userRoutes.get('/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        if (!userId || userId.trim() === '') {
            return next((0, errorHandler_1.createError)('User ID is required', 400));
        }
        // Check cache first
        const cachedUser = index_1.cache.get(userId);
        if (cachedUser) {
            logger_1.logger.info('Cache HIT', { userId, component: 'user-routes' });
            return res.json(cachedUser);
        }
        logger_1.logger.info('Cache MISS - queuing DB job', { userId, component: 'user-routes' });
        // Check if there's already a pending request for this user
        let userPromise = pendingRequests.get(userId);
        if (!userPromise) {
            // Create new async DB job
            userPromise = new Promise(async (resolve, reject) => {
                try {
                    // Try to use job queue, fallback to direct simulation if Redis unavailable
                    try {
                        const job = await (0, jobQueue_1.addDBJob)(userId, 'fetch');
                        const result = await job.waitUntilFinished({});
                        resolve(result.user);
                    }
                    catch (queueError) {
                        // Fallback to direct simulation if Redis is not available
                        logger_1.logger.warn('Queue unavailable, using direct simulation', { userId, error: queueError instanceof Error ? queueError.message : 'Unknown' });
                        // Direct simulation fallback
                        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay
                        const mockUsers = [
                            { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01T00:00:00Z' },
                            { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-01-02T00:00:00Z' },
                            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2023-01-03T00:00:00Z' }
                        ];
                        const user = mockUsers.find(u => u.id === userId) || null;
                        resolve(user);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
            pendingRequests.set(userId, userPromise);
            // Clean up pending request when done
            userPromise.finally(() => {
                pendingRequests.delete(userId);
            });
        }
        else {
            logger_1.logger.info('Waiting for pending request', { userId, component: 'user-routes' });
        }
        const user = await userPromise;
        if (!user) {
            return next((0, errorHandler_1.createError)('User not found', 404));
        }
        // Cache the result
        index_1.cache.set(userId, user);
        logger_1.logger.info('User fetched and cached', { userId, component: 'user-routes' });
        res.json(user);
    }
    catch (error) {
        logger_1.logger.error('Error in GET /users/:id', {
            userId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            component: 'user-routes'
        });
        next(error);
    }
});
// POST /users
exports.userRoutes.post('/', async (req, res, next) => {
    try {
        const { id, name, email } = req.body;
        if (!id || !name || !email) {
            return next((0, errorHandler_1.createError)('Missing required fields: id, name, email', 400));
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next((0, errorHandler_1.createError)('Invalid email format', 400));
        }
        const newUser = {
            id: id.toString(),
            name: name.toString().trim(),
            email: email.toString().toLowerCase().trim(),
            createdAt: new Date().toISOString()
        };
        // Queue user creation job
        logger_1.logger.info('Creating new user via job queue', { userId: newUser.id, component: 'user-routes' });
        const job = await (0, jobQueue_1.addDBJob)(newUser.id, 'create', newUser);
        const result = await job.waitUntilFinished({});
        // Cache the new user
        index_1.cache.set(newUser.id, newUser);
        logger_1.logger.info('New user created and cached', { userId: newUser.id, component: 'user-routes' });
        res.status(201).json(newUser);
    }
    catch (error) {
        logger_1.logger.error('Error in POST /users', {
            error: error instanceof Error ? error.message : 'Unknown error',
            component: 'user-routes'
        });
        next(error);
    }
});
// DELETE /cache - Clear all cached entries (Bonus requirement)
exports.userRoutes.delete('/cache', (req, res) => {
    try {
        const entriesRemoved = index_1.cache.size();
        index_1.cache.clear();
        logger_1.logger.info('Cache cleared manually', {
            entriesRemoved,
            component: 'user-routes'
        });
        res.json({
            message: 'Cache cleared successfully',
            entriesRemoved,
            currentSize: index_1.cache.size()
        });
    }
    catch (error) {
        logger_1.logger.error('Error clearing cache', {
            error: error instanceof Error ? error.message : 'Unknown error',
            component: 'user-routes'
        });
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});
// GET /cache-status - Cache performance metrics (Bonus requirement)
exports.userRoutes.get('/cache/stats', (req, res) => {
    try {
        const stats = index_1.cache.getStats();
        logger_1.logger.info('Cache stats requested', {
            stats,
            component: 'user-routes'
        });
        res.json({
            ...stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting cache stats', {
            error: error instanceof Error ? error.message : 'Unknown error',
            component: 'user-routes'
        });
        res.status(500).json({ error: 'Failed to get cache statistics' });
    }
});
//# sourceMappingURL=userRoutes.js.map