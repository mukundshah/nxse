import { IncomingMessage } from 'node:http';
import { Readable } from 'node:stream';
import { UploadedFile, InMemoryFile, TemporaryUploadedFile } from './uploaded';
import os from 'node:os';
import path from 'node:path';

export interface FileUploadHandler {
  handle(field: string, fileName: string, contentType: string | null, content: Readable): Promise<UploadedFile>;
  cleanup(): Promise<void>;
}

export class MemoryFileUploadHandler implements FileUploadHandler {
  private files: InMemoryFile[] = [];

  async handle(field: string, fileName: string, contentType: string | null, content: Readable): Promise<InMemoryFile> {
    const chunks: Buffer[] = [];
    for await (const chunk of content) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const file = new InMemoryFile(fileName, buffer);
    file.contentType = contentType;
    this.files.push(file);
    return file;
  }

  async cleanup(): Promise<void> {
    this.files.forEach(file => file.close());
    this.files = [];
  }
}

export class TemporaryFileUploadHandler implements FileUploadHandler {
  private files: TemporaryUploadedFile[] = [];
  private tempDir: string;

  constructor(tempDir: string = path.join(os.tmpdir(), 'uploads')) {
    this.tempDir = tempDir;
  }

  async handle(field: string, fileName: string, contentType: string | null, content: Readable): Promise<TemporaryUploadedFile> {
    const file = new TemporaryUploadedFile(fileName, content, contentType, 0, this.tempDir);
    this.files.push(file);
    return file;
  }

  async cleanup(): Promise<void> {
    await Promise.all(this.files.map(file => file.cleanup()));
    this.files = [];
  }
}
