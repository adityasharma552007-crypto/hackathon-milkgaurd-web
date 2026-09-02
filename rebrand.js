const fs = require('fs');
const path = require('path');

const replacements = [
  { pattern: /MilkGuard/g, replacement: 'AquaIntel' },
  { pattern: /milk_data/g, replacement: 'water_data' },
  { pattern: /milk/g, replacement: 'water' },
  { pattern: /Milk/g, replacement: 'Water' },
  { pattern: /urea/g, replacement: 'lead' },
  { pattern: /Urea/g, replacement: 'Lead' },
  { pattern: /detergent/g, replacement: 'bacteria' },
  { pattern: /Detergent/g, replacement: 'Bacteria' },
  { pattern: /starch/g, replacement: 'arsenic' },
  { pattern: /Starch/g, replacement: 'Arsenic' },
  { pattern: /formalin/g, replacement: 'fluoride' },
  { pattern: /Formalin/g, replacement: 'Fluoride' },
  { pattern: /glucose/g, replacement: 'iron' },
  { pattern: /Glucose/g, replacement: 'Iron' },
  { pattern: /salt/g, replacement: 'nitrates' },
  { pattern: /Salt/g, replacement: 'Nitrates' },
  { pattern: /ammonium sulphate/g, replacement: 'turbidity' },
  { pattern: /Ammonium Sulphate/g, replacement: 'Turbidity' },
];

function processPath(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      if (['node_modules', '.next', '.git'].includes(file)) continue;
      processPath(path.join(targetPath, file));
    }
  } else {
    // only process text-based files
    if (targetPath.match(/\.(ts|tsx|js|jsx|json|md|sql|html|css|csv)$/)) {
      let content = fs.readFileSync(targetPath, 'utf8');
      replacements.forEach(({ pattern, replacement }) => {
        content = content.replace(pattern, replacement);
      });
      fs.writeFileSync(targetPath, content, 'utf8');
    }
  }
}

function renamePaths(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      if (['node_modules', '.next', '.git'].includes(file)) continue;
      const fullPath = path.join(targetPath, file);
      renamePaths(fullPath);
    }
  }
  const dirname = path.dirname(targetPath);
  const basename = path.basename(targetPath);
  if (basename.includes('milk') || basename.includes('Milk')) {
    const newBasename = basename.replace(/milk/g, 'water').replace(/Milk/g, 'Water');
    const newPath = path.join(dirname, newBasename);
    fs.renameSync(targetPath, newPath);
  }
}

const root = path.join(__dirname, 'water-adulteration');
processPath(root);
renamePaths(root);

console.log('Rebranding completed.');
