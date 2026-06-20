import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), tailwind()],
  server: {
    port: 3000,
    host: true,
    // Disabled so `astro dev` boots cleanly in headless/CI environments where
    // there is no browser to launch (avoids `spawn xdg-open ENOENT`).
    open: false
  }
});
