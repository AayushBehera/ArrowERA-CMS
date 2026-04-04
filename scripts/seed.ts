import { cms } from '../packages/emdash/src/core';
import * as examplePlugin from '../plugins/example-plugin';
import manifest from '../plugins/example-plugin/manifest.json';

async function seed() {
  console.log('🌱 Seeding database...');
  
  // Register plugin
  cms.sandbox.registerPlugin(manifest as any, examplePlugin);
  
  // Create sample content
  await cms.createEntry('posts', {
    title: 'Hello World from ArrorEra CMS',
    excerpt: 'This is a sample post created by the seed script.',
    content: [
      {
        type: 'paragraph',
        children: [{ text: 'Welcome to the future of content management.' }]
      }
    ]
  });
  
  await cms.createEntry('posts', {
    title: 'The Power of Plugins',
    excerpt: 'Learn how the sandboxed plugin system works.',
    content: [
      {
        type: 'paragraph',
        children: [{ text: 'Plugins run in an isolated environment with strict capabilities.' }]
      }
    ]
  });
  
  console.log('✅ Seeding complete!');
}

seed().catch(console.error);
