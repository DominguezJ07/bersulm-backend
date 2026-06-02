import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const COMMIT_MSG_FILE = process.argv[2];
if (!COMMIT_MSG_FILE) {
  process.exit(0);
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: process.cwd() }).trim();
  } catch {
    return '';
  }
}

const stagedStat = exec('git diff --cached --stat');
if (!stagedStat) {
  process.exit(0);
}

const stagedFiles = stagedStat
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((l) => !/\d+ files? changed/.test(l));

const breakdown = { feat: [], fix: [], refactor: [], chore: [], test: [], docs: [] };

for (const line of stagedFiles) {
  const file = line.split('|')[0]?.trim();
  if (!file) continue;

  if (file.startsWith('test') || file.includes('.test.') || file.includes('.spec.')) {
    breakdown.test.push(file);
  } else if (file.startsWith('docs') || file.endsWith('.md')) {
    breakdown.docs.push(file);
  } else if (
    file.includes('application/') ||
    file.includes('domain/') ||
    file.includes('controller') ||
    file.includes('routes')
  ) {
    breakdown.feat.push(file);
  } else if (file.includes('infrastructure/') || file.includes('Model')) {
    breakdown.feat.push(file);
  } else if (file.includes('middleware') || file.includes('middlewares')) {
    breakdown.fix.push(file);
  } else if (file.startsWith('package.json') || file.startsWith('skills-lock') || file.startsWith('scripts/')) {
    breakdown.chore.push(file);
  } else if (file.startsWith('src/shared/')) {
    breakdown.refactor.push(file);
  } else if (file.includes('middleware') || file.includes('fix') || file.includes('bug')) {
    breakdown.fix.push(file);
  } else {
    breakdown.chore.push(file);
  }
}

function getScope(files) {
  const scopes = new Set();
  for (const f of files) {
    const parts = f.split('/');
    if (parts[0] === 'src' && parts[1] === 'domains' && parts[2]) {
      scopes.add(parts[2]);
    } else if (parts[0] === 'src' && parts[2] === 'cron') {
      scopes.add('cron');
    } else if (parts[0] === 'src' && parts[2] === 'middlewares') {
      scopes.add('auth');
    } else if (parts[0] === 'src' && parts[1] === 'database') {
      scopes.add('seed');
    }
  }
  return [...scopes].join(',') || 'general';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const types = ['feat', 'fix', 'refactor', 'chore', 'test', 'docs'];
let primaryType = 'chore';

for (const t of types) {
  if (breakdown[t].length > 0) {
    primaryType = t;
    break;
  }
}

const scope = getScope(stagedFiles);
const lines = [];
for (const t of types) {
  if (breakdown[t].length > 0) {
    for (const f of breakdown[t]) {
      const desc = f
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      lines.push(`- ${capitalize(desc)} (${f})`);
    }
  }
}

let message = `${primaryType}(${scope}): ${stagedFiles.length} archivos modificados\n\n`;
message += lines.slice(0, 15).join('\n');
if (lines.length > 15) {
  message += `\n- ... y ${lines.length - 15} cambios más`;
}

writeFileSync(COMMIT_MSG_FILE, message, 'utf8');
