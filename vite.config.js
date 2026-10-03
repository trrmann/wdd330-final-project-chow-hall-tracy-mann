import {
  defineConfig
} from 'vite';
import {
  tmpdir
} from 'node:os';
import {
  join
} from 'node:path';

export default defineConfig({
  cacheDir: join(tmpdir(), 'wdd330-final-project-chow-hall-tracy-mann', '.vite'),
});
