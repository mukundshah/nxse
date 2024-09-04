import AWS from "aws-sdk";
import { BaseStorage } from "./base";

class S3Storage extends BaseStorage {
  constructor(bucketName, options = {}) {
    super();
    this.s3 = new AWS.S3(options);
    this.bucketName = bucketName;
  }

  async save(fileName, content) {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: content,
    };
    await this.s3.upload(params).promise();
    return fileName;
  }

  async delete(fileName) {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };
    await this.s3.deleteObject(params).promise();
  }

  async exists(fileName) {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };
    try {
      await this.s3.headObject(params).promise();
      return true;
    } catch {
      return false;
    }
  }

  async url(fileName) {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.bucketName,
      Key: fileName,
      Expires: 3600, // URL expires in 1 hour
    });
  }

  async get(fileName) {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };
    const result = await this.s3.getObject(params).promise();
    return result.Body;
  }

  async list(prefix = "") {
    const params = {
      Bucket: this.bucketName,
      Prefix: prefix,
    };
    const result = await this.s3.listObjectsV2(params).promise();
    return result.Contents.map((item) => item.Key);
  }
}
