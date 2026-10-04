import {
  writeFile
} from 'node:fs/promises';
import {
  resolve
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';

const canvas = {
  width: 1600,
  height: 1000
};
const seed = Number.parseInt(process.argv[2] ?? '330', 10);
const outputDirectory = resolve(fileURLToPath(new URL('../public/images/', import.meta.url)));

if (!Number.isInteger(seed)) {
  throw new Error('Provide an integer seed, for example: node scripts/generate-camo.js 330');
}

function makeRandom(seedValue) {
  let state = seedValue >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function makeShapePath(random) {
  const pointCount = 10 + Math.floor(random() * 7);
  const points = Array.from({
    length: pointCount
  }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2 + (random() - 0.5) * 0.16;
    const radius = random() < 0.22 ? 0.3 + random() * 0.22 : 0.68 + random() * 0.42;
    const x = 50 + Math.cos(angle) * radius * 49;
    const y = 35 + Math.sin(angle) * radius * 34;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });

  return `M${points.join('L')}Z`;
}

function makePlacements(random) {
  const placements = [];
  const columns = 5;
  const rows = 4;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const centerX = ((column + 0.5) * canvas.width) / columns + (random() - 0.5) * 170;
      const centerY = ((row + 0.5) * canvas.height) / rows + (random() - 0.5) * 120;
      const patchCount = 5 + Math.floor(random() * 4);

      for (let patch = 0; patch < patchCount; patch += 1) {
        const x = centerX + (random() - 0.5) * 170;
        const y = centerY + (random() - 0.5) * 125;
        const width = 150 + random() * 170;
        const height = 85 + random() * 115;
        const rotation = Math.round((random() - 0.5) * 70);
        const colorIndex = Math.floor(random() * 6);

        placements.push({
          shapeIndex: Math.floor(random() * 16),
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
          rotation,
          centerX: x,
          centerY: y,
          colorIndex,
        });
      }
    }
  }

  return placements;
}

function renderSvg(shapes, placements, baseColor, colors) {
  const definitions = shapes.map((path, index) => `    <symbol id="patch-${index}" viewBox="0 0 100 70"><path d="${path}" /></symbol>`).join('\n');
  const patches = placements.map((patch) => {
    const transform = `rotate(${patch.rotation} ${patch.centerX.toFixed(1)} ${patch.centerY.toFixed(1)})`;

    return `  <use href="#patch-${patch.shapeIndex}" x="${patch.x.toFixed(1)}" y="${patch.y.toFixed(1)}" width="${patch.width.toFixed(1)}" height="${patch.height.toFixed(1)}" fill="${colors[patch.colorIndex]}" transform="${transform}" />`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" preserveAspectRatio="xMidYMid slice">
  <rect width="${canvas.width}" height="${canvas.height}" fill="${baseColor}" />
  <defs>
${definitions}
  </defs>
${patches}
</svg>
`;
}

const random = makeRandom(seed);
const shapes = Array.from({
  length: 16
}, () => makeShapePath(random));
const placements = makePlacements(random);
const lightColors = ['#C2A878', '#BDA77A', '#5F6B3C', '#4B5D42', '#7B5A3A', '#A66A3F'];
const darkColors = ['#474438', '#464133', '#3E472E', '#344132', '#4A382A', '#4A372B'];

await Promise.all([
  writeFile(resolve(outputDirectory, 'desert-camo.svg'), renderSvg(shapes, placements, '#D7C5A4', lightColors)),
  writeFile(resolve(outputDirectory, 'desert-camo-dark.svg'), renderSvg(shapes, placements, '#232323', darkColors)),
]);

console.log(`Generated 16-shape desert camo SVGs with seed ${seed}.`);
