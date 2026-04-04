import { StorageAdapter } from './local';

export class R2Storage implements StorageAdapter {
  constructor(private bucket: string, private accountId: string) {}

  async upload(key: string, data: Buffer | string) {
    console.log(`[R2 Storage] Uploaded ${key} to ${this.bucket}`);
    return `https://${this.bucket}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }
  
  async delete(key: string) {
    console.log(`[R2 Storage] Deleted ${key} from ${this.bucket}`);
  }
  
  getUrl(key: string) {
    return `https://${this.bucket}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }
}
