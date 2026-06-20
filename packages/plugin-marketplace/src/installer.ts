export class PluginInstaller {
  async install(pluginId: string) {
    console.log(`[Marketplace] Installing plugin ${pluginId}`);
    return true;
  }
}
