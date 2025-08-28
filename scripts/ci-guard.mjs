// Fail build if forbidden legacy tokens are found in source code.
// Allow UI placeholders and MD docs to pass; focus on runtime code.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const roots = ['src'];
const forbid = [
  /\bstorageCatalog\b/,
  /\bProgramSlugs\b/,
  /\bAirtable\b/,
  /'mock-user'/
];

// Ignore generated UI atoms where "placeholder" may appear legitimately
const ignoreDirs = [
  'src/components/ui'
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = join(dir, d.name);
    if (d.isDirectory()) {
      if (ignoreDirs.some(id => p.replace(/\\/g,'/').startsWith(id))) return [];
      return walk(p);
    }
    return [p];
  });
}

const files = roots.flatMap(walk).filter(p => p.endsWith('.ts') || p.endsWith('.tsx'));
let failed = false;

for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const rx of forbid) {
    if (rx.test(text)) {
      console.error(`Forbidden token ${rx} in ${f}`);
      failed = true;
    }
  }
}
if (failed) {
  console.error('Legacy tokens detected. Blocked to prevent regressions.');
  process.exit(1);
}
