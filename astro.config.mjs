import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  site: 'https://neohexane.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()]
});
