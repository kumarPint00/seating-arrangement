import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../index';
import { createError } from '../middleware/errorHandler';
import { User } from '../services/userService';
import { addDBJob, getJobResult } from '../utils/jobQueue';
import { logger } from '../utils/logger';

export const userRoutes = Router();

// Concurrent request handling - track pending requests
const pendingRequests = new Map<string, Promise<User | null>>();

// GET /users/:id
userRoutes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    
    if (!userId || userId.trim() === '') {
      return next(createError('User ID is required', 400));
    }

    // Check cache first
    const cachedUser = cache.get(userId);
    if (cachedUser) {
      logger.info('Cache HIT', { userId, component: 'user-routes' });
      return res.json(cachedUser);
    }

    logger.info('Cache MISS - queuing DB job', { userId, component: 'user-routes' });

    // Check if there's already a pending request for this user
    let userPromise = pendingRequests.get(userId);
    
    if (!userPromise) {
      // Create new async DB job
      userPromise = new Promise(async (resolve, reject) => {
        try {
          // Try to use job queue, fallback to direct simulation if Redis unavailable
          try {
            const job = await addDBJob(userId, 'fetch');
            const result = await job.waitUntilFinished({} as any);
            resolve(result.user);
          } catch (queueError) {
            // Fallback to direct simulation if Redis is not available
            logger.warn('Queue unavailable, using direct simulation', { userId, error: queueError instanceof Error ? queueError.message : 'Unknown' });
            
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
        } catch (error) {
          reject(error);
        }
      });
      
      pendingRequests.set(userId, userPromise);
      
      // Clean up pending request when done
      userPromise.finally(() => {
        pendingRequests.delete(userId);
      });
    } else {
      logger.info('Waiting for pending request', { userId, component: 'user-routes' });
    }

    const user = await userPromise;
    
    if (!user) {
      return next(createError('User not found', 404));
    }

    // Cache the result
    cache.set(userId, user);
    logger.info('User fetched and cached', { userId, component: 'user-routes' });

    res.json(user);
  } catch (error) {
    logger.error('Error in GET /users/:id', { 
      userId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'user-routes'
    });
    next(error);
  }
});

// POST /users
userRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, email } = req.body;
    
    if (!id || !name || !email) {
      return next(createError('Missing required fields: id, name, email', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError('Invalid email format', 400));
    }

    const newUser: User = {
      id: id.toString(),
      name: name.toString().trim(),
      email: email.toString().toLowerCase().trim(),
      createdAt: new Date().toISOString()
    };

    // Queue user creation job
    logger.info('Creating new user via job queue', { userId: newUser.id, component: 'user-routes' });
    
    const job = await addDBJob(newUser.id, 'create', newUser);
    const result = await job.waitUntilFinished({} as any);

    // Cache the new user
    cache.set(newUser.id, newUser);
    logger.info('New user created and cached', { userId: newUser.id, component: 'user-routes' });

    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error in POST /users', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'user-routes'
    });
    next(error);
  }
});

// DELETE /cache - Clear all cached entries (Bonus requirement)
userRoutes.delete('/cache', (req: Request, res: Response) => {
  try {
    const entriesRemoved = cache.size();
    cache.clear();
    
    logger.info('Cache cleared manually', { 
      entriesRemoved, 
      component: 'user-routes' 
    });

    res.json({
      message: 'Cache cleared successfully',
      entriesRemoved,
      currentSize: cache.size()
    });
  } catch (error) {
    logger.error('Error clearing cache', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'user-routes'
    });
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// GET /cache-status - Cache performance metrics (Bonus requirement)
userRoutes.get('/cache/stats', (req: Request, res: Response) => {
  try {
    const stats = cache.getStats();
    
    logger.info('Cache stats requested', { 
      stats, 
      component: 'user-routes' 
    });

    res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting cache stats', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'user-routes'
    });
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});