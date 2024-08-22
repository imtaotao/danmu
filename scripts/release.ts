import fs from 'node:fs';
import semver from 'semver';
import bumpPrompt from '@jsdevtools/version-bump-prompt';
import { run, log, args } from './utils';

// pnpm release --patch -> 1.0.1
// pnpm release --minor -> 1.1.0
// pnpm release --major -> 2.0.0
// pnpm release --beta  -> 1.0.1-beta-1645598740512.0
type ReleaseType = 'prerelease' | 'patch' | 'minor' | 'major';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

let type: ReleaseType = 'patch'; // default

if (args.beta) {
  type = 'prerelease';
} else if (args.minor) {
  type = 'minor';
} else if (args.major) {
  type = 'major';
}

release(type);

export async function release(releaseType: ReleaseType) {
  if (!pkg.version) return;
  log('\nBuilding...');
  await build();

  const data = await bumpVersion(releaseType);

  log('\nCommitting changes...');
  await commit(data.newVersion);

  log('\nPublish...');
  await publish(data.newVersion);

  log('\nPush to GitHub...');
  await run('git', ['push']);

  log(`\nUpdated: "${data.oldVersion}" -> "${data.newVersion}"`);
}

function build() {
  return run('pnpm', ['run', 'core:build']);
}

async function publish(version: string) {
  let publishArgs = ['publish', '--access', 'public', '--no-git-checks'];

  if (version) {
    let releaseTag = 'latest';
    if (version.includes('alpha')) {
      releaseTag = 'alpha';
    } else if (version.includes('beta')) {
      releaseTag = 'beta';
    } else if (version.includes('rc')) {
      releaseTag = 'rc';
    }
    publishArgs = publishArgs.concat(['--tag', releaseTag]);
  }
  return run('pnpm', publishArgs);
}

async function commit(version: string) {
  await run('git', ['add', '-A']);
  await run('git', ['commit', '-m', `release: v${version}`]);
  await run('git', ['tag', `v${version}`]);
}

function bumpVersion(releaseType: ReleaseType) {
  if (releaseType === 'prerelease') {
    const identifier = `beta-${Number(new Date())}`;
    releaseType = semver.inc(pkg.version, releaseType, identifier) as any;
  }
  return bumpPrompt({
    tag: false,
    push: false,
    release: releaseType,
    files: ['./package.json'],
  });
}
