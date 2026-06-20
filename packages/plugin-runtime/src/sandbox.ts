import { PluginManifest } from './capabilities';

export class PluginSandbox {
  private plugins: Map<string, any> = new Map();

  registerPlugin(manifest: PluginManifest, pluginCode: any) {
    // In a real environment, this would use isolated-vm or Web Workers
    // For this demo, we simulate a sandbox by restricting the context
    console.log(`Registering plugin: ${manifest.name} with capabilities: ${manifest.capabilities.join(', ')}`);
    
    const context = this.createContext(manifest);
    
    if (typeof pluginCode.setup === 'function') {
      pluginCode.setup(context);
    }
    
    this.plugins.set(manifest.name, pluginCode);
  }

  private createContext(manifest: PluginManifest) {
    const context: any = {};
    
    if (manifest.capabilities.includes('read:content')) {
      context.readContent = () => {
        console.log(`[Plugin ${manifest.name}] Reading content...`);
        return [];
      };
    }
    
    if (manifest.capabilities.includes('email:send')) {
      context.sendEmail = (to: string, subject: string) => {
        console.log(`[Plugin ${manifest.name}] Sending email to ${to}: ${subject}`);
      };
    }
    
    return context;
  }
  
  executeHook(hookName: string, ...args: any[]) {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.hooks && typeof plugin.hooks[hookName] === 'function') {
        try {
          plugin.hooks[hookName](...args);
        } catch (e) {
          console.error(`Error executing hook ${hookName} in plugin ${name}:`, e);
        }
      }
    }
  }
}
