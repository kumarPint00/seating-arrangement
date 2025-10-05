import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { userRoutes } from './routes/userRoutes';
import { cacheRoutes } from './routes/cacheRoutes';
import { errorHandler } from './middleware/errorHandler';
import { EnhancedLRUCache } from './utils/EnhancedLRUCache';
import { User } from './services/userService';
import { logger } from './utils/logger';
import { closeQueue } from './utils/jobQueue';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize enhanced cache instance
export const cache = new EnhancedLRUCache<User>(1000, 60); // Max 1000 entries, 60s TTL

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Burst rate limiting
const burstLimiter = rateLimit({
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
app.use('/users', userRoutes);
app.use('/cache', cacheRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async () => {
  logger.info('Shutting down server gracefully');
  
  try {
    await closeQueue();
    cache.destroy();
    logger.info('Cleanup completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(PORT, () => {
  logger.info('🚀 Event Seating API Server Started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    cacheCapacity: 1000,
    cacheTTL: '60s'
  });
});

export default app;
export { server };