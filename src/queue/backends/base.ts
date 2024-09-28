export interface Job<T = any> {
  id: string;
  data: T;
  attempts?: number;
  delay?: number;
  priority?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export interface JobResult<T = any> {
  id: string;
  data: T;
  result?: any;
  error?: Error;
  status: 'completed' | 'failed' | 'delayed' | 'active' | 'waiting';
  progress?: number;
  attempts: number;
  timestamp: number;
}

export interface QueueBackend {
  add<T>(queueName: string, job: Job<T>): Promise<string>;
  remove(queueName: string, jobId: string): Promise<void>;
  get<T>(queueName: string, jobId: string): Promise<JobResult<T> | null>;
  getJobs<T>(queueName: string, status?: string): Promise<JobResult<T>[]>;
  process<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<any>
  ): Promise<void>;
  pause(queueName: string): Promise<void>;
  resume(queueName: string): Promise<void>;
  clear(queueName: string): Promise<void>;
  close(): Promise<void>;
}
