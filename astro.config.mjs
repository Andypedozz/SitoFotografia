// @ts-check
import { defineConfig } from 'astro/config';
import { findDb, initDb } from './src/lib/initDb';

import node from '@astrojs/node';
import { fillDb } from './fillDb';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),
});

initDb();
fillDb();