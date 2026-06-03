import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(__dirname, 'src');
console.log('VITE_ALIAS_SRC_PATH', srcPath);

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
});
