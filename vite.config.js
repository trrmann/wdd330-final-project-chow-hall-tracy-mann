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
        mealPlan: resolve(projectRoot, 'MealPlan/index.html'),
        inventory: resolve(projectRoot, 'Inventory/index.html'),
        shopping: resolve(projectRoot, 'Shopping/index.html'),
        search: resolve(projectRoot, 'Search/index.html'),
        recipe: resolve(projectRoot, 'Recipe/index.html'),
        country: resolve(projectRoot, 'Country/index.html'),
      },
    },
  },
});
