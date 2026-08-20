import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    outExtension: () => ({ js: '.mjs', dts: '.d.mts' }),
    clean: true,
    sourcemap: true,
  },
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    outExtension: () => ({ js: '.js', dts: '.d.ts' }),
    sourcemap: true,
  },
]);