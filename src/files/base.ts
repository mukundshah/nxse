import { Readable } from 'node:stream';
import { Stats } from 'node:fs';
import path from 'node:path';

export class File {
  name: string;
  size: number;
  content: Buffer | Readable | null;
  contentType: string | null;
  charset: string | null;
  stats: Stats | null;

  constructor(name: string, content: Buffer | Readable | null = null) {
    this.name = name;
    this.content = content;
    this.size = 0;
    this.contentType = null;
    this.charset = null;
    this.stats = null;
  }

  get extension(): string {
    return path.extname(this.name).toLowerCase();
  }

  get basename(): string {
    return path.basename(this.name);
  }

  async chunks(): AsyncGenerator<Buffer> {
    if (this.content instanceof Buffer) {
      yield this.content;
    } else if (this.content instanceof Readable) {
      for await (const chunk of this.content) {
        yield chunk;
      }
    }
  }

  async read(): Promise<Buffer> {
    if (this.content instanceof Buffer) {
      return this.content;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.chunks()) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  close(): void {
    if (this.content instanceof Readable) {
      this.content.destroy();
    }
    this.content = null;
  }
}

export class ImageFile extends File {
  width: number | null = null;
  height: number | null = null;

  constructor(name: string, content: Buffer | Readable | null = null) {
    super(name, content);
    this.contentType = this.guessImageContentType();
  }

  private guessImageContentType(): string {
    const ext = this.extension;
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
