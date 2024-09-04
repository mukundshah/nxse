import { Readable } from 'node:stream';
import { File } from './base';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import os from 'node:os';

export class UploadedFile extends File {
  private _contentRead: boolean = false;

  constructor(
    name: string,
    content: Buffer | Readable | null = null,
    contentType: string | null = null,
    size: number = 0
  ) {
    super(name, content);
    this.contentType = contentType;
    this.size = size;
  }

  get isRead(): boolean {
    return this._contentRead;
  }

  async read(): Promise<Buffer> {
    const content = await super.read();
    this._contentRead = true;
    return content;
  }
}

export class InMemoryFile extends UploadedFile {
  constructor(name: string, content: Buffer) {
    super(name, content);
    this.size = content.length;
  }
}

export class TemporaryUploadedFile extends UploadedFile {
  private tempDir: string;
  private tempPath: string | null = null;

  constructor(
    name: string,
    content: Buffer | Readable | null = null,
    contentType: string | null = null,
    size: number = 0,
    tempDir: string = os.tmpdir()
  ) {
    super(name, content, contentType, size);
    this.tempDir = tempDir;
  }

  private async ensureTempDir(): Promise<void> {
    await mkdir(this.tempDir, { recursive: true });
  }

  private generateTempPath(): string {
    const randomName = randomBytes(16).toString('hex');
    return join(this.tempDir, `upload_${randomName}`);
  }

  async moveTo(path: string): Promise<void> {
    if (!this.tempPath) {
      const content = await this.read();
      await writeFile(path, content);
    } else {
      // Move the temporary file to the new location
      // This would use fs.rename in a real implementation
      const content = await this.read();
      await writeFile(path, content);
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.tempPath) {
      try {
        await unlink(this.tempPath);
      } catch (error) {
        // Ignore errors when cleaning up temporary files
      }
      this.tempPath = null;
    }
    this.close();
  }
}
