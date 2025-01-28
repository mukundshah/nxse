import type { Job, JobResult, QueueBackend } from './base.js';
import { PrismaClient } from '@prisma/client';

export interface DatabaseQueueConfig {
  prisma?: PrismaClient;
  pollingInterval?: number;
  maxAttempts?: number;
  retryDelay?: number;
}

export class DatabaseQueueBackend implements QueueBackend {
  private prisma: PrismaClient;
  private handlers: Map<string, (job: Job<any>) => Promise<any>> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timer> = new Map();
  private running: boolean = true;

  constructor(private config: DatabaseQueueConfig = {}) {
    this.prisma = config.prisma || new PrismaClient();
  }

  private async ensureQueue(queueName: string): Promise<void> {
    // No need to create tables - they should be created by Prisma migrations
  }

  async add<T>(queueName: string, job: Job<T>): Promise<string> {
    const queueJob = await this.prisma.queueJob.create({
      data: {
        id: job.id,
        queue: queueName,
        data: job.data as any,
        status: 'waiting',
        attempts: 0,
        maxAttempts: job.attempts || this.config.maxAttempts || 3,
        priority: job.priority || 0,
        delay: job.delay || 0,
        removeOnComplete: job.removeOnComplete || false,
        removeOnFail: job.removeOnFail || false,
        createdAt: new Date(),
        processAt: job.delay
          ? new Date(Date.now() + job.delay)
          : new Date()
      }
    });

    return queueJob.id;
  }

  async remove(queueName: string, jobId: string): Promise<void> {
    await this.prisma.queueJob.delete({
      where: {
        id: jobId,
        queue: queueName
      }
    });
  }

  async get<T>(queueName: string, jobId: string): Promise<JobResult<T> | null> {
    const job = await this.prisma.queueJob.findUnique({
      where: {
        id: jobId,
        queue: queueName
      }
    });

    if (!job) return null;

    return {
      id: job.id,
      data: job.data as T,
      result: job.result,
      error: job.error ? new Error(job.error) : undefined,
      status: job.status as any,
      progress: job.progress,
      attempts: job.attempts,
      timestamp: job.createdAt.getTime()
    };
  }

  async getJobs<T>(queueName: string, status?: string): Promise<JobResult<T>[]> {
    const jobs = await this.prisma.queueJob.findMany({
      where: {
        queue: queueName,
        ...(status ? { status } : {})
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return jobs.map(job => ({
      id: job.id,
      data: job.data as T,
      result: job.result,
      error: job.error ? new Error(job.error) : undefined,
      status: job.status as any,
      progress: job.progress,
      attempts: job.attempts,
      timestamp: job.createdAt.getTime()
    }));
  }

  private async processNextJob<T>(queueName: string, handler: (job: Job<T>) => Promise<any>): Promise<void> {
    const now = new Date();

    // Get and lock the next available job
    const job = await this.prisma.$transaction(async (tx) => {
      const nextJob = await tx.queueJob.findFirst({
        where: {
          queue: queueName,
          status: { in: ['waiting', 'failed'] },
          processAt: { lte: now },
          attempts: { lt: tx.queueJob.fields.maxAttempts }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });

      if (!nextJob) return null;

      return tx.queueJob.update({
        where: { id: nextJob.id },
        data: {
          status: 'active',
          attempts: { increment: 1 },
          startedAt: now
        }
      });
    });

    if (!job) return;

    try {
      const result = await handler({
        id: job.id,
        data: job.data as T,
        attempts: job.attempts
      });

      await this.prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          result,
          finishedAt: new Date(),
          ...(job.removeOnComplete ? { deletedAt: new Date() } : {})
        }
      });
    } catch (error) {
      const retryDelay = this.config.retryDelay || 5000;
      const nextAttemptAt = new Date(Date.now() + retryDelay);

      await this.prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          processAt: nextAttemptAt,
          ...(job.attempts >= (job.maxAttempts || this.config.maxAttempts || 3) && job.removeOnFail
            ? { deletedAt: new Date() }
            : {})
        }
      });
    }
  }

  async process<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<any>
  ): Promise<void> {
    if (this.handlers.has(queueName)) {
      throw new Error(`Handler already exists for queue: ${queueName}`);
    }

    this.handlers.set(queueName, handler);

    const interval = setInterval(async () => {
      if (!this.running) return;
      await this.processNextJob(queueName, handler);
    }, this.config.pollingInterval || 1000);

    this.pollingIntervals.set(queueName, interval);
  }

  async pause(queueName: string): Promise<void> {
    this.running = false;
    const interval = this.pollingIntervals.get(queueName);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(queueName);
    }
  }

  async resume(queueName: string): Promise<void> {
    this.running = true;
    if (this.handlers.has(queueName)) {
      const handler = this.handlers.get(queueName)!;
      await this.process(queueName, handler);
    }
  }

  async clear(queueName: string): Promise<void> {
    await this.prisma.queueJob.deleteMany({
      where: { queue: queueName }
    });
  }

  async close(): Promise<void> {
    this.running = false;

    // Clear all polling intervals
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
    this.handlers.clear();

    // Disconnect from database
    await this.prisma.$disconnect();
  }
}
