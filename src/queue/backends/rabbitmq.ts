import type { Job, JobResult, QueueBackend } from './base.js';
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';

export interface RabbitMQConfig {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  vhost?: string;
  heartbeat?: number;
  prefetch?: number;
}

export class RabbitMQBackend implements QueueBackend {
  private connection: Connection | null = null;
  private channels: Map<string, Channel> = new Map();
  private handlers: Map<string, (job: Job<any>) => Promise<any>> = new Map();
  private consumerTags: Map<string, string> = new Map();

  constructor(private config: RabbitMQConfig = {}) {}

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      const url = this.config.url ||
        `amqp://${this.config.username || 'guest'}:${this.config.password || 'guest'}@${this.config.host || 'localhost'}:${this.config.port || 5672}${this.config.vhost || '/'}`;
      this.connection = await connect(url, {
        heartbeat: this.config.heartbeat || 60
      });
    }
    return this.connection;
  }

  private async getChannel(queueName: string): Promise<Channel> {
    let channel = this.channels.get(queueName);
    if (!channel) {
      const connection = await this.getConnection();
      channel = await connection.createChannel();
      await channel.assertQueue(queueName, { durable: true });
      if (this.config.prefetch) {
        await channel.prefetch(this.config.prefetch);
      }
      this.channels.set(queueName, channel);
    }
    return channel;
  }

  private async ensureQueue(queueName: string): Promise<void> {
    const channel = await this.getChannel(queueName);
    await channel.assertQueue(queueName, { durable: true });
  }

  async add<T>(queueName: string, job: Job<T>): Promise<string> {
    await this.ensureQueue(queueName);
    const channel = await this.getChannel(queueName);

    const message = {
      id: job.id,
      data: job.data,
      attempts: job.attempts,
      timestamp: Date.now()
    };

    const options = {
      persistent: true,
      priority: job.priority,
      headers: {
        'x-delay': job.delay,
        'x-remove-on-complete': job.removeOnComplete,
        'x-remove-on-fail': job.removeOnFail
      }
    };

    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), options);
    return job.id;
  }

  async remove(queueName: string, jobId: string): Promise<void> {
    // RabbitMQ doesn't support removing specific messages
    // This is a no-op
  }

  async get<T>(queueName: string, jobId: string): Promise<JobResult<T> | null> {
    // RabbitMQ doesn't support getting specific messages
    // This is a no-op
    return null;
  }

  async getJobs<T>(queueName: string, status?: string): Promise<JobResult<T>[]> {
    // RabbitMQ doesn't support listing messages
    // This is a no-op
    return [];
  }

  async process<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<any>
  ): Promise<void> {
    if (this.handlers.has(queueName)) {
      throw new Error(`Handler already exists for queue: ${queueName}`);
    }

    await this.ensureQueue(queueName);
    const channel = await this.getChannel(queueName);
    this.handlers.set(queueName, handler);

    const { consumerTag } = await channel.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const message = JSON.parse(msg.content.toString());
        const job: Job<T> = {
          id: message.id,
          data: message.data,
          attempts: message.attempts
        };

        await handler(job);
        channel.ack(msg);
      } catch (error) {
        // Handle failed jobs
        const headers = msg.properties.headers || {};
        const attempts = (headers['x-death']?.length || 0) + 1;
        const maxAttempts = headers['x-max-attempts'] || 3;

        if (attempts >= maxAttempts) {
          // Max retries reached, dead letter the message
          channel.nack(msg, false, false);
        } else {
          // Retry the message
          channel.nack(msg, false, true);
        }
      }
    });

    this.consumerTags.set(queueName, consumerTag);
  }

  async pause(queueName: string): Promise<void> {
    const consumerTag = this.consumerTags.get(queueName);
    if (consumerTag) {
      const channel = await this.getChannel(queueName);
      await channel.cancel(consumerTag);
      this.consumerTags.delete(queueName);
    }
  }

  async resume(queueName: string): Promise<void> {
    if (this.handlers.has(queueName)) {
      const handler = this.handlers.get(queueName)!;
      await this.process(queueName, handler);
    }
  }

  async clear(queueName: string): Promise<void> {
    const channel = await this.getChannel(queueName);
    await channel.purgeQueue(queueName);
  }

  async close(): Promise<void> {
    // Close all channels
    for (const channel of this.channels.values()) {
      await channel.close();
    }
    this.channels.clear();

    // Close connection
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }

    this.handlers.clear();
    this.consumerTags.clear();
  }
}
