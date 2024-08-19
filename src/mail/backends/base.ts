interface EmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export abstract class BaseEmailBackend {
  async open(): Promise<void> {
    throw new Error("open() must be implemented by an email backend");
  }

  async close(): Promise<void> {
    throw new Error("close() must be implemented by an email backend");
  }

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {
    throw new Error("send() must be implemented by an email backend");
  }
}
