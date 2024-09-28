import { Queue, Worker, QueueEvents, Job as BullJob } from 'bullmq';
import type { Job, JobResult, QueueBackend } from './base.js';
import { Redis } from 'ioredis';

export interface BullMQConfig {
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    url?: string;
  };
  prefix?: string;
}

export class BullMQBackend implements QueueBackend {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private events: Map<string, QueueEvents> = new Map();
  private connection: Redis;

  constructor(private config: BullMQConfig = {}) {
    const redisConfig = config.redis || {};
    const url = redisConfig.url || `redis://${redisConfig.host || 'localhost'}:${redisConfig.port || 6379}`;
    this.connection = new Redis(url, {
      password: redisConfig.password,
      db: redisConfig.db
    });
  }

  private getQueue(queueName: string): Queue {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = new Queue(queueName, {
        connection: this.connection,
        prefix: this.config.prefix
      });
      this.queues.set(queueName, queue);
    }
    return queue;
  }

  private convertBullJobToResult<T>(job: BullJob<T, any, string>): JobResult<T> {
    return {
      id: job.id,
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason ? new Error(job.failedReason) : undefined,
      status: job.finishedOn ? 'completed' :
             job.failedOn ? 'failed' :
             job.delay ? 'delayed' :
             job.processedOn ? 'active' : 'waiting',
      progress: job.progress,
      attempts: job.attemptsMade,
      timestamp: job.timestamp
    };
  }

  async add<T>(queueName: string, job: Job<T>): Promise<string> {
    const queue = this.getQueue(queueName);
    const result = await queue.add(queueName, job.data, {
      attempts: job.attempts,
      delay: job.delay,
      priority: job.priority,
      removeOnComplete: job.removeOnComplete,
      removeOnFail: job.removeOnFail
    });
    return result.id;
  }

  async remove(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async get<T>(queueName: string, jobId: string): Promise<JobResult<T> | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    return job ? this.convertBullJobToResult(job) : null;
  }

  async getJobs<T>(queueName: string, status?: string): Promise<JobResult<T>[]> {
    const queue = this.getQueue(queueName);
    let jobs: BullJob[];

    switch (status) {
      case 'completed':
        jobs = await queue.getCompleted();
        break;
      case 'failed':
        jobs = await queue.getFailed();
        break;
      case 'delayed':
        jobs = await queue.getDelayed();
        break;
      case 'active':
        jobs = await queue.getActive();
        break;
      case 'waiting':
        jobs = await queue.getWaiting();
        break;
      default:
        jobs = await queue.getJobs();
    }

    return jobs.map(job => this.convertBullJobToResult(job));
  }

  async process<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<any>
  ): Promise<void> {
    if (this.workers.has(queueName)) {
      throw new Error(`Worker already exists for queue: ${queueName}`);
    }

    const worker = new Worker(queueName,
      async (job) => {
        const result = await handler({
          id: job.id,
          data: job.data,
          attempts: job.opts.attempts,
          delay: job.opts.delay,
          priority: job.opts.priority,
          removeOnComplete: job.opts.removeOnComplete,
          removeOnFail: job.opts.removeOnFail
        });
        return result;
      },
      { connection: this.connection }
    );

    this.workers.set(queueName, worker);

    // Set up queue events
    const events = new QueueEvents(queueName, { connection: this.connection });
    this.events.set(queueName, events);
  }

  async pause(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  async resume(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  async clear(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.obliterate();
  }

  async close(): Promise<void> {
    await Promise.all([
      ...Array.from(this.queues.values()).map(queue => queue.close()),
      ...Array.from(this.workers.values()).map(worker => worker.close()),
      ...Array.from(this.events.values()).map(events => events.close())
    ]);

    await this.connection.quit();

    this.queues.clear();
    this.workers.clear();
    this.events.clear();
  }
}
