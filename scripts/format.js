import {
  readdir,
  readFile,
  writeFile
} from 'node:fs/promises';
import {
  extname,
  join,
  relative
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';
import beautify from 'js-beautify';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const excludedDirectories = new Set(['.git', '.dist', '.vite', 'dist', 'node_modules']);
const formatterByExtension = new Map([
  ['.html', beautify.html],
  ['.css', beautify.css],
  ['.js', beautify.js],
]);
const checkOnly = process.argv.includes('--check');
const unformattedFiles = [];

async function formatDirectory(directory) {
  for (const entry of await readdir(directory, {
      withFileTypes: true
    })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        await formatDirectory(entryPath);
      }
      continue;
    }

    const formatter = formatterByExtension.get(extname(entry.name));
    if (!formatter) continue;

    const source = await readFile(entryPath, 'utf8');
    const formatted = formatter(source, {
      end_with_newline: true,
      indent_size: 2,
    });

    if (source !== formatted) {
      if (checkOnly) {
        unformattedFiles.push(relative(projectRoot, entryPath));
      } else {
        await writeFile(entryPath, formatted);
      }
    }
  }
}

await formatDirectory(projectRoot);

if (checkOnly && unformattedFiles.length > 0) {
  console.error('Files need formatting:');
  for (const file of unformattedFiles) {
    console.error(`  ${file}`);
  }
  process.exitCode = 1;
} else if (checkOnly) {
  console.log('All HTML, CSS, and JavaScript files are formatted.');
}
