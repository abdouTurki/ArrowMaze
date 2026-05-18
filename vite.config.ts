/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ArrowMaze/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  server: {
    port: 5173,
    open: false,
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
