import nodemailer from 'nodemailer';
import { BaseEmailBackend } from './base';

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
}

export class SMTPEmailBackend extends BaseEmailBackend {
  private transporter: nodemailer.Transporter;

  constructor(config: SMTPConfig) {
    super();
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async open(): Promise<void> {
    await this.transporter.verify();
  }

  async close(): Promise<void> {
    await this.transporter.close();
  }

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    for (const message of messageArray) {
      await this.transporter.sendMail(message);
    }
  }
}
