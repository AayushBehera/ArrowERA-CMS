import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  server: {
    open: true
  }
});
