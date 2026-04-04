export class BuilderState {
  blocks: any[] = [];
  
  addBlock(block: any) {
    this.blocks.push(block);
    console.log(`[Builder] Added block: ${block.type}`);
  }
}
