import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { BaseEmailBackend } from './base';

export class SESEmailBackend extends BaseEmailBackend {
  private client: SESClient;

  constructor(config: { region: string }) {
    super();
    this.client = new SESClient({ region: config.region });
  }

  async open(): Promise<void> {}

  async close(): Promise<void> {}

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    for (const message of messageArray) {
      const command = new SendEmailCommand({
        Source: message.from,
        Destination: {
          ToAddresses: Array.isArray(message.to) ? message.to : [message.to],
        },
        Message: {
          Subject: { Data: message.subject },
          Body: {
            Text: message.text ? { Data: message.text } : undefined,
            Html: message.html ? { Data: message.html } : undefined,
          },
        },
      });

      await this.client.send(command);
    }
  }
}
