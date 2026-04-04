export class WorkspaceManager {
  createWorkspace(name: string) {
    console.log(`[Team] Created workspace: ${name}`);
    return { id: 'ws1', name };
  }
}
