import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
declare const redis: IORedis;
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
export declare const dbQueue: Queue<DBOperationJob, any, string, DBOperationJob, any, string>;
declare const worker: Worker<DBOperationJob, DBOperationResult, string>;
export declare const addDBJob: (userId: string, operation: "fetch" | "create", userData?: any) => Promise<Job<DBOperationJob>>;
export declare const getJobResult: (jobId: string) => Promise<DBOperationResult | null>;
export declare const closeQueue: () => Promise<void>;
export { redis, worker };
//# sourceMappingURL=jobQueue.d.ts.map