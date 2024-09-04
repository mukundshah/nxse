import fs from "node:fs/promises";
import path from "node:path";

import { BaseStorage } from "./base";

class LocalStorage extends BaseStorage {
  constructor(basePath) {
    super();
    this.basePath = basePath;
  }

  async save(fileName, content) {
    const filePath = path.join(this.basePath, fileName);
    await fs.writeFile(filePath, content);
    return fileName;
  }

  async delete(fileName) {
    const filePath = path.join(this.basePath, fileName);
    await fs.unlink(filePath);
  }

  async exists(fileName) {
    const filePath = path.join(this.basePath, fileName);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async url(fileName) {
    return `file://${path.join(this.basePath, fileName)}`;
  }

  async get(fileName) {
    const filePath = path.join(this.basePath, fileName);
    return fs.readFile(filePath);
  }

  async list(prefix = "") {
    const dirPath = path.join(this.basePath, prefix);
    return fs.readdir(dirPath);
  }
}
