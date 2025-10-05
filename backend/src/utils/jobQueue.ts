import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from './logger';

// Redis connection configuration for BullMQ
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,  // Required for BullMQ
  retryDelayOnFailover: 100,
  lazyConnect: true
};

// Create Redis connection with error handling
const redis = new IORedis(redisConfig);

// Handle Redis connection errors gracefully
redis.on('error', (error) => {
  logger.warn('Redis connection failed - running without queue functionality', { error: error.message });
});

// Job data interfaces
interface DBOperationJob {
  userId: string;
  operation: 'fetch' | 'create';
  userData?: any;
}

interface DBOperationResult {
  userId: string;
  user: any | null;
  timestamp: number;
}

// Create job queue
export const dbQueue = new Queue<DBOperationJob>('database-operations', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Job processor
const worker = new Worker<DBOperationJob, DBOperationResult>(
  'database-operations',
  async (job: Job<DBOperationJob>) => {
    const { userId, operation, userData } = job.data;
    
    logger.info(`Processing DB operation`, {
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
      
      logger.info(`DB fetch completed`, {
        userId,
        found: !!user,
        component: 'queue'
      });

      return {
        userId,
        user,
        timestamp: Date.now()
      };
    } else if (operation === 'create') {
      logger.info(`DB create completed`, {
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
  },
  {
    connection: redis,
    concurrency: 5 // Process up to 5 jobs concurrently
  }
);

// Event listeners
worker.on('completed', (job: Job) => {
  logger.info(`Job completed`, {
    jobId: job.id,
    component: 'queue'
  });
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`Job failed`, {
    jobId: job?.id,
    error: err.message,
    component: 'queue'
  });
});

worker.on('error', (err: Error) => {
  logger.error(`Worker error`, {
    error: err.message,
    component: 'queue'
  });
});

// Queue management functions
export const addDBJob = async (userId: string, operation: 'fetch' | 'create', userData?: any): Promise<Job<DBOperationJob>> => {
  const job = await dbQueue.add('db-operation', {
    userId,
    operation,
    userData
  }, {
    jobId: `${operation}-${userId}-${Date.now()}`, // Unique job ID
    priority: operation === 'create' ? 10 : 5 // Prioritize creates over fetches
  });

  logger.info(`DB job queued`, {
    jobId: job.id,
    userId,
    operation,
    component: 'queue'
  });

  return job;
};

// Get job result
export const getJobResult = async (jobId: string): Promise<DBOperationResult | null> => {
  try {
    const job = await Job.fromId(dbQueue, jobId);
    if (job && job.finishedOn) {
      return job.returnvalue as DBOperationResult;
    }
    return null;
  } catch (error) {
    logger.error(`Error getting job result`, {
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error',
      component: 'queue'
    });
    return null;
  }
};

// Graceful shutdown
export const closeQueue = async (): Promise<void> => {
  logger.info('Closing job queue and worker', { component: 'queue' });
  await worker.close();
  await dbQueue.close();
  redis.disconnect();
};

// Handle process shutdown
process.on('SIGTERM', closeQueue);
process.on('SIGINT', closeQueue);

export { redis, worker };