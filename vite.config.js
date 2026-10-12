import {
  defineConfig
} from 'vite';
import {
  tmpdir
} from 'node:os';
import {
  join,
  resolve
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  cacheDir: join(tmpdir(), 'wdd330-final-project-chow-hall-tracy-mann', '.vite'),
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        mealPlan: resolve(projectRoot, 'mealplan/index.html'),
        inventory: resolve(projectRoot, 'inventory/index.html'),
        shopping: resolve(projectRoot, 'shopping/index.html'),
        search: resolve(projectRoot, 'search/index.html'),
        recipe: resolve(projectRoot, 'recipe/index.html'),
        country: resolve(projectRoot, 'country/index.html'),
      },
    },
  },
});
