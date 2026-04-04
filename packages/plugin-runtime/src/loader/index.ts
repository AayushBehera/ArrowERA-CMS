export class PluginLoader {
  async load(pluginPath: string) {
    console.log(`[PluginLoader] Loading plugin from ${pluginPath}`);
    // Dynamic import logic would go here
    return { name: 'loaded-plugin' };
  }
}
