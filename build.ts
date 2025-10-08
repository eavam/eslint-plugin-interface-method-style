#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

console.log('🔨 Building with Bun...');

async function build() {
  try {
    // Clean dist directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }

    console.log('📦 Bundling JavaScript/TypeScript...');

    // Build ESM version
    console.log('  📄 Building ESM bundle...');
    const esmResult = await Bun.build({
      entrypoints: ['src/index.ts'],
      outdir: 'dist',
      format: 'esm',
      target: 'node',
      sourcemap: 'linked',
      external: [
        '@typescript-eslint/types',
        '@typescript-eslint/utils',
        '@typescript-eslint/parser',
        'typescript'
      ],
      minify: {
        whitespace: true,
        syntax: true,
        identifiers: false,
      },
      banner: '// Built with Bun 🚀',
      naming: {
        entry: 'index.js',
      },
    });

    // Build CJS version
    console.log('  📦 Building CJS bundle...');
    const cjsResult = await Bun.build({
      entrypoints: ['src/index.ts'],
      outdir: 'dist',
      format: 'cjs',
      target: 'node',
      sourcemap: 'linked',
      external: [
        '@typescript-eslint/types',
        '@typescript-eslint/utils',
        '@typescript-eslint/parser',
        'typescript'
      ],
      minify: {
        whitespace: true,
        syntax: true,
        identifiers: false,
      },
      banner: '// Built with Bun 🚀',
      naming: {
        entry: 'index.cjs',
      },
    });

    // Check for build errors
    if (!esmResult.success || !cjsResult.success) {
      console.error('❌ Build failed with errors:');
      if (!esmResult.success) {
        console.error('  ESM build errors:');
        for (const log of esmResult.logs) {
          console.error('    ', log);
        }
      }
      if (!cjsResult.success) {
        console.error('  CJS build errors:');
        for (const log of cjsResult.logs) {
          console.error('    ', log);
        }
      }
      process.exit(1);
    }

    // Combine outputs for statistics
    const allOutputs = [...esmResult.outputs, ...cjsResult.outputs];

    console.log('📝 Generating TypeScript declarations...');
    try {
      execSync('bunx tsc --emitDeclarationOnly --outDir dist', {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error('❌ TypeScript declaration generation failed');
      throw error;
    }

    // Output statistics
    const jsOutputs = allOutputs.filter(out => out.kind === 'entry-point');
    console.log('✅ Build completed successfully!');
    console.log(`📦 Generated ${jsOutputs.length} bundle(s):`);

    for (const output of jsOutputs) {
      const buffer = await output.arrayBuffer();
      const size = buffer.byteLength;
      const sizeKB = (size / 1024).toFixed(1);
      console.log(`  • ${output.path} (${sizeKB} KB)`);
    }

  } catch (error) {
    console.error('❌ Build failed:', String(error));
    process.exit(1);
  }
}

build();
