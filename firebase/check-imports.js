/*
 * Verify that every route's destructured imports from ../data and ../util
 * actually exist in those modules' exports.
 *
 *   Usage: node check-imports.js        (run from firebase/ or firebase/functions)
 */
const fs = require('fs');
const path = require('path');

const here = __dirname;
const functionsDir = path.join(here, 'functions');
const dataFile = path.join(functionsDir, 'src', 'data.js');
const utilFile = path.join(functionsDir, 'src', 'util.js');
const routesDir = path.join(functionsDir, 'src', 'routes');

if (!fs.existsSync(routesDir)) {
  console.error('routes dir not found:', routesDir);
  process.exit(1);
}

function exportNames(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\};/);
  if (!m) return [];
  return m[1]
    .split(',')
    .map((s) => s.replace(/\/\*.*?\*\//gs, '').trim())
    .filter(Boolean);
}

const dataExports = exportNames(dataFile);
const utilExports = exportNames(utilFile);

let bad = 0;
for (const f of fs.readdirSync(routesDir)) {
  if (!f.endsWith('.js')) continue;
  const src = fs.readFileSync(path.join(routesDir, f), 'utf8');
  for (const [mod, exports] of [['../data', dataExports], ['../util', utilExports]]) {
    const re = new RegExp("const\\s*\\{([^}]*)\\}\\s*=\\s*require\\('" + mod + "'\\)");
    const m = src.match(re);
    if (!m) continue;
    const names = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    const missing = names.filter((n) => !exports.includes(n));
    if (missing.length) {
      bad++;
      console.log('MISSING ' + f + ' (' + mod + '): ' + missing.join(', '));
    }
  }
}

console.log(bad === 0 ? 'ALL ROUTE IMPORTS VALID' : bad + ' FILES WITH BAD IMPORTS');
process.exit(bad === 0 ? 0 : 1);