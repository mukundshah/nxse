import { writeFile } from 'fs/promises';
import { join } from 'path';
import { BaseEmailBackend } from './base';

export class FileSystemEmailBackend extends BaseEmailBackend {
  private outputDir: string;

  constructor(outputDir: string) {
    super();
    this.outputDir = outputDir;
  }

  async open(): Promise<void> {}

  async close(): Promise<void> {}

  async send(messages: EmailMessage | EmailMessage[]): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    for (const message of messageArray) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `email-${timestamp}.json`;
      await writeFile(
        join(this.outputDir, filename),
        JSON.stringify(message, null, 2)
      );
    }
  }
}
