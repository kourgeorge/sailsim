import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { selectTests, areas } from './test-selection.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const profile = args.shift() || 'smoke';
let area,
  base,
  list = false,
  browser = false,
  browserOnly = false,
  skipBuild = false;
try {
  if (profile === 'area') area = args.shift();
  while (args.length) {
    const arg = args.shift();
    if (arg === '--base') {
      base = args.shift();
      if (!base) throw new Error('--base requires a Git revision');
    } else if (arg === '--list') list = true;
    else if (arg === '--browser') browser = true;
    else if (arg === '--browser-only') browser = browserOnly = true;
    else if (arg === '--skip-build') skipBuild = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  const git = (...command) =>
    execFileSync('git', command, { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  let files = [];
  if (profile === 'changed') {
    // No base: staged, unstaged and untracked changes. With base: commits since
    // the merge base plus local edits. CI fetches history before supplying it.
    const revisions = base ? [`${git('merge-base', base, 'HEAD')[0].trim()}`] : ['HEAD'];
    files = [
      ...new Set([
        ...git('diff', '--name-only', '-z', '--no-renames', ...revisions, '--'),
        ...git('ls-files', '--others', '--exclude-standard', '-z'),
      ]),
    ];
  }
  const plan = selectTests({ root, files, profile, area });
  const units = browserOnly ? [] : plan.unit;
  const specs = browser ? plan.browser : [];
  console.log(`Test profile: ${profile}${area ? ` / ${area}` : ''}`);
  for (const reason of plan.reasons) console.log(`  ${reason}`);
  console.log(
    `Selected: ${units.length} unit files; ${browser ? `${specs.length} browser files${plan.grep ? ' (only @smoke tests)' : ''}` : 'browser tests opt-in with --browser'}`,
  );
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Test selection: ${profile}\n\n${plan.reasons.map((s) => `- ${s}`).join('\n')}\n\n${units.length} unit files; ${specs.length} browser files${plan.grep ? ' filtered to @smoke' : ''}.\n`,
    );
  if (list) {
    for (const file of [...units, ...specs]) console.log(`  ${file}`);
  } else {
    const run = (command, commandArgs) => {
      const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) process.exit(result.status || 1);
    };
    if (units.length) run(process.execPath, ['--test', ...units]);
    if (specs.length) {
      if (!skipBuild) run('npm', ['run', 'build']);
      run(process.execPath, [
        'node_modules/@playwright/test/cli.js',
        'test',
        ...specs,
        ...(plan.grep ? ['--grep', plan.grep] : []),
      ]);
    }
    if (!units.length && !specs.length) console.log('No matching tests. Nothing was run.');
  }
} catch (error) {
  console.error(error.message);
  console.error(
    `Usage: node scripts/test.mjs smoke|changed|full|area [${Object.keys(areas).join('|')}] [--base REF] [--browser|--browser-only] [--list] [--skip-build]`,
  );
  process.exitCode = 1;
}
