import { StorageAdapter } from './local';

export class S3Storage implements StorageAdapter {
  constructor(private bucket: string, private region: string) {}

  async upload(key: string, data: Buffer | string) {
    console.log(`[S3 Storage] Uploaded ${key} to ${this.bucket}`);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
  
  async delete(key: string) {
    console.log(`[S3 Storage] Deleted ${key} from ${this.bucket}`);
  }
  
  getUrl(key: string) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
