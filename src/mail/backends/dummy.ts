import { BaseEmailBackend } from './base';

export class DummyEmailBackend extends BaseEmailBackend {
  async open(): Promise<void> {}

  async close(): Promise<void> {}

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {}
}
