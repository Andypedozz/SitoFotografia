// @ts-check
import { defineConfig } from 'astro/config';
import { initDb } from './src/lib/initDb';

// https://astro.build/config
export default defineConfig({
    output: 'server',
});

initDb();
