import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../index';
import { logger } from '../utils/logger';

export const cacheRoutes = Router();

// DELETE /cache - Clear all cache
cacheRoutes.delete('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const statsBefore = cache.getStats();
    cache.clear();
    const statsAfter = cache.getStats();
    
    logger.info('Cache manually cleared', { 
      entriesRemoved: statsBefore.size,
      component: 'cache-routes'
    });
    
    res.json({
      message: 'Cache cleared successfully',
      entriesRemoved: statsBefore.size,
      currentSize: statsAfter.size
    });
  } catch (error) {
    next(error);
  }
});

// GET /cache-status - Get cache statistics
cacheRoutes.get('-status', (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = cache.getStats();
    
    // Calculate hit ratio
    const totalRequests = stats.hits + stats.misses;
    const hitRatio = totalRequests > 0 ? (stats.hits / totalRequests * 100).toFixed(2) : '0.00';
    
    res.json({
      ...stats,
      hitRatio: `${hitRatio}%`,
      totalRequests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});