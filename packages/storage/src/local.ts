export interface StorageAdapter {
  upload(key: string, data: Buffer | string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

export class LocalStorage implements StorageAdapter {
  async upload(key: string, data: Buffer | string) {
    console.log(`[Local Storage] Uploaded ${key}`);
    return `/uploads/${key}`;
  }
  
  async delete(key: string) {
    console.log(`[Local Storage] Deleted ${key}`);
  }
  
  getUrl(key: string) {
    return `/uploads/${key}`;
  }
}
