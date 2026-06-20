export type Capability = 'read:content' | 'write:content' | 'email:send' | 'kv:storage';

export interface PluginManifest {
  name: string;
  version: string;
  capabilities: Capability[];
}
