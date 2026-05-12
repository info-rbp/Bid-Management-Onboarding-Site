import fs from 'node:fs';
import path from 'node:path';

const validationPath = path.join(process.cwd(), 'src/lib/onboardingValidation.ts');
const onboardingDir = path.join(process.cwd(), 'src/app/onboarding');

const validationSource = fs.readFileSync(validationPath, 'utf8');

const fieldKeys = new Set();

for (const match of validationSource.matchAll(/toError\('([^']+)'/g)) {
  fieldKeys.add(match[1]);
}

for (const match of validationSource.matchAll(/toError\(`([^`$]+)\$\{[^`]+`/g)) {
  fieldKeys.add(`${match[1]}*`);
}

const componentText = fs
  .readdirSync(onboardingDir)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => fs.readFileSync(path.join(onboardingDir, file), 'utf8'))
  .join('\n');

const exactMatches = [];
const missing = [];

for (const key of [...fieldKeys].sort()) {
  if (key.includes('*')) continue;

  const hasId = componentText.includes(`id="${key}"`) || componentText.includes(`id='${key}'`) || componentText.includes(`validationProps('${key}')`) || componentText.includes(`validationProps("${key}")`);

  if (hasId) exactMatches.push(key);
  else missing.push(key);
}

console.log(`Exact validation anchors found: ${exactMatches.length}`);
console.log(`Missing exact validation anchors: ${missing.length}`);

if (missing.length > 0) {
  console.log('\nMissing keys:');
  for (const key of missing) {
    console.log(`- ${key}`);
  }
}
