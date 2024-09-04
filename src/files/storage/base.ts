class BaseStorage {
  async save(fileName, content) {
    throw new Error("save() must be implemented by a storage backend");
  }

  async delete(fileName) {
    throw new Error("delete() must be implemented by a storage backend");
  }

  async exists(fileName) {
    throw new Error("exists() must be implemented by a storage backend");
  }

  async url(fileName) {
    throw new Error("url() must be implemented by a storage backend");
  }

  async get(fileName) {
    throw new Error("get() must be implemented by a storage backend");
  }

  async list(prefix = "") {
    throw new Error("list() must be implemented by a storage backend");
  }

  async size(fileName) {
    throw new Error("size() must be implemented by a storage backend");
  }
}
