import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const intentionallyCompositeAnchors = new Set([
  'keyPeople',
  'deliveryPartners',
  'caseStudies',
  'insurancePolicies',
  'pricingApprover',
  'accessController',
  'alertRecipients',
  'selectedServices',
  'mainGoals',
  'interestedOpportunityChannels',
  'pricingMethods',
  'existingAccounts',
  'setupOrImprove',
  'writtenPoliciesProcedures',
  'draftReviewers',
  'reviewFeedbackPreferences',
]);

const validationSource = readFileSync('src/lib/onboardingValidation.ts', 'utf8');
const keyRegexes = [
  /toError\(\s*['"]([^'"]+)['"]/g,
  /fieldKey:\s*['"]([^'"]+)['"]/g,
  /anchorId:\s*['"]([^'"]+)['"]/g,
];
const validationKeys = new Set();
for (const re of keyRegexes) {
  let m; while ((m = re.exec(validationSource))) validationKeys.add(m[1]);
}

const dirs = ['src/app/onboarding', 'src/components'];
let corpus = '';
for (const dir of dirs) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.tsx')) corpus += '\n' + readFileSync(join(dir, f), 'utf8');
  }
}

const anchorMatched = new Set();
for (const key of validationKeys) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`id=["']${escaped}["']`),
    new RegExp(`validationProps\\(\\s*["']${escaped}["']\\s*\\)`),
    new RegExp(`renderFieldError\\(\\s*["']${escaped}["']\\s*\\)`),
    new RegExp(`data-validation-anchor=["']${escaped}["']`),
  ];
  if (patterns.some((p) => p.test(corpus))) anchorMatched.add(key);
}

const missing = [...validationKeys].filter((k) => !anchorMatched.has(k));
const unexplained = missing.filter((k) => !intentionallyCompositeAnchors.has(k));

console.log(`Validation keys found: ${validationKeys.size}`);
console.log(`Anchors found: ${anchorMatched.size}`);
console.log(`Allowlisted composite anchors: ${missing.filter((k)=>intentionallyCompositeAnchors.has(k)).length}`);
if (missing.length) console.log('Missing keys:', missing.join(', '));

if (unexplained.length) {
  console.error('Unexplained missing keys:', unexplained.join(', '));
  process.exit(1);
}
