import { BaseEmailBackend } from './base';

export class ConsoleEmailBackend extends BaseEmailBackend {
  async open(): Promise<void> {
    console.log('Console email backend initialized');
  }

  async close(): Promise<void> {
    console.log('Console email backend closed');
  }

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    for (const message of messageArray) {
      console.log('------ Email Message ------');
      console.log('From:', message.from);
      console.log('To:', message.to);
      console.log('Subject:', message.subject);
      console.log('Text:', message.text);
      console.log('HTML:', message.html);
      console.log('------------------------');
    }
  }
}
