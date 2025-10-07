#!/usr/bin/env bun

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔨 Building with Bun...');

async function build() {
  try {
    // Clean dist directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }

    console.log('📦 Bundling JavaScript/TypeScript...');

    const result = await Bun.build({
      entrypoints: ['src/index.ts'],
      outdir: 'dist',
      format: 'esm', // ESM as the main format
      target: 'node',
      sourcemap: 'linked',
      external: [
        '@typescript-eslint/*',
        'typescript'
      ],
      // Additional options for better bundling
      minify: {
        whitespace: true,
        syntax: true,
        identifiers: false, // preserve readable names
      },
      banner: '// Built with Bun 🚀',
    });

    if (!result.success) {
      console.error('❌ Build failed with errors:');
      for (const log of result.logs) {
        console.error('  ', log);
      }
      process.exit(1);
    }

    console.log('📝 Generating TypeScript declarations...');
    execSync('tsc --emitDeclarationOnly --outDir dist', {
      cwd: __dirname,
      stdio: 'inherit'
    });

    // Output statistics
    const jsOutputs = result.outputs.filter(out => out.kind === 'entry-point');
    console.log('✅ Build completed successfully!');
    console.log(`📦 Generated ${jsOutputs.length} bundle(s):`);

    for (const output of jsOutputs) {
      const buffer = await output.arrayBuffer();
      const size = buffer.byteLength;
      const sizeKB = (size / 1024).toFixed(1);
      console.log(`  • ${output.path} (${sizeKB} KB)`);
    }

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
