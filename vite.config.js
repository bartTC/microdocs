import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Automatically discover all template directories in templates_src/
const templatesSrcDir = resolve(__dirname, 'templates_src');
const templatesOutputDir = resolve(__dirname, 'microdocs/templates');

// Get all template directories
const templateDirs = readdirSync(templatesSrcDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !['__fixtures__', 'playwright-fixtures'].includes(dirent.name))
  .map(dirent => dirent.name);

// Create build configuration for each template
const input = {};
templateDirs.forEach(templateName => {
  input[templateName] = resolve(templatesSrcDir, templateName, `${templateName}.html`);
});

// Plugin to remove type="module" after viteSingleFile inlines everything
function removeModuleAttribute() {
  return {
    name: 'remove-module-attribute',
    apply: 'build',
    enforce: 'post',
    writeBundle() {
      templateDirs.forEach(templateName => {
        const htmlPath = resolve(templatesOutputDir, templateName, `${templateName}.html`);
        let html = readFileSync(htmlPath, 'utf-8');
        // Remove type="module" and crossorigin from inline scripts
        html = html.replace(/<script type="module" crossorigin>/g, '<script>');
        writeFileSync(htmlPath, html, 'utf-8');
      });
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    viteSingleFile({
      removeViteModuleLoader: true
    }),
    removeModuleAttribute()
  ],
  root: templatesSrcDir,
  build: {
    rollupOptions: {
      input,
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        manualChunks: undefined
      }
    },
    outDir: templatesOutputDir,
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      }
    }
  }
});
