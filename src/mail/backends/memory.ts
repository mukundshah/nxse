import { BaseEmailBackend } from './base';

export class MemoryEmailBackend extends BaseEmailBackend {
  private sentEmails: EmailMessage[] = [];

  async open(): Promise<void> {}

  async close(): Promise<void> {
    this.sentEmails = [];
  }

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    this.sentEmails.push(...messageArray);
  }

  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails];
  }
}
