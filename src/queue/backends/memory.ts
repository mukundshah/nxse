import type { Job, JobResult, QueueBackend } from './base';
import { EventEmitter } from 'events';

interface QueueJob<T> extends Job<T> {
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  result?: any;
  error?: Error;
  progress?: number;
  timestamp: number;
  processAfter?: number;
}

export class MemoryQueueBackend implements QueueBackend {
  private queues: Map<string, QueueJob<any>[]> = new Map();
  private handlers: Map<string, (job: Job<any>) => Promise<any>> = new Map();
  private events: Map<string, EventEmitter> = new Map();
  private running: boolean = true;

  private getQueue(queueName: string): QueueJob<any>[] {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = [];
      this.queues.set(queueName, queue);
    }
    return queue;
  }

  private getEvents(queueName: string): EventEmitter {
    let emitter = this.events.get(queueName);
    if (!emitter) {
      emitter = new EventEmitter();
      this.events.set(queueName, emitter);
    }
    return emitter;
  }

  private async processQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const handler = this.handlers.get(queueName);
    const events = this.getEvents(queueName);

    if (!handler || !this.running) return;

    const now = Date.now();
    const job = queue.find(j =>
      (j.status === 'waiting' || j.status === 'delayed') &&
      (!j.processAfter || j.processAfter <= now)
    );

    if (job) {
      job.status = 'active';
      events.emit('active', { jobId: job.id });

      try {
        const result = await handler(job);
        job.result = result;
        job.status = 'completed';
        events.emit('completed', { jobId: job.id, result });
      } catch (error) {
        job.error = error as Error;
        job.status = 'failed';
        events.emit('failed', { jobId: job.id, error });
      }
    }

    // Continue processing if there are more jobs
    if (this.running) {
      setTimeout(() => this.processQueue(queueName), 100);
    }
  }

  async add<T>(queueName: string, job: Job<T>): Promise<string> {
    const queue = this.getQueue(queueName);
    const queueJob: QueueJob<T> = {
      ...job,
      status: job.delay ? 'delayed' : 'waiting',
      timestamp: Date.now(),
      processAfter: job.delay ? Date.now() + job.delay : undefined
    };
    queue.push(queueJob);

    const events = this.getEvents(queueName);
    events.emit('waiting', { jobId: job.id });

    // Start processing if not already running
    this.processQueue(queueName);

    return job.id;
  }

  async remove(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const index = queue.findIndex(job => job.id === jobId);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  async get<T>(queueName: string, jobId: string): Promise<JobResult<T> | null> {
    const queue = this.getQueue(queueName);
    const job = queue.find(j => j.id === jobId);
    if (!job) return null;

    return {
      id: job.id,
      data: job.data,
      result: job.result,
      error: job.error,
      status: job.status,
      progress: job.progress,
      attempts: job.attempts || 0,
      timestamp: job.timestamp
    };
  }

  async getJobs<T>(queueName: string, status?: string): Promise<JobResult<T>[]> {
    const queue = this.getQueue(queueName);
    return queue
      .filter(job => !status || job.status === status)
      .map(job => ({
        id: job.id,
        data: job.data,
        result: job.result,
        error: job.error,
        status: job.status,
        progress: job.progress,
        attempts: job.attempts || 0,
        timestamp: job.timestamp
      }));
  }

  async process<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<any>
  ): Promise<void> {
    if (this.handlers.has(queueName)) {
      throw new Error(`Handler already exists for queue: ${queueName}`);
    }

    this.handlers.set(queueName, handler);
    this.processQueue(queueName);
  }

  async pause(queueName: string): Promise<void> {
    this.running = false;
  }

  async resume(queueName: string): Promise<void> {
    this.running = true;
    this.processQueue(queueName);
  }

  async clear(queueName: string): Promise<void> {
    this.queues.delete(queueName);
  }

  async close(): Promise<void> {
    this.running = false;
    this.queues.clear();
    this.handlers.clear();
    this.events.clear();
  }
}
