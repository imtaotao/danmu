// pnpm release --patch -> 1.0.1
// pnpm release --minor -> 1.1.0
// pnpm release --major -> 2.0.0
// pnpm release --beta  -> 1.0.1-beta-1645598740512.0

import fs from 'node:fs';
import chalk from 'chalk';
import semver from 'semver';
import minimist from 'minimist';
import bumpPrompt from '@jsdevtools/version-bump-prompt';

type ReleaseType = 'prerelease' | 'patch' | 'minor' | 'major';

const args = minimist(process.argv.slice(2));

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const log = (msg: string) => console.log(chalk.cyan(msg));

let type: ReleaseType = 'patch'; // default

async function run(bin: string, args: Array<string>, opts = {}) {
  const { execa } = await import('execa');
  const result = await execa(bin, args, {
    stdio: 'pipe',
    cwd: process.cwd(),
    ...opts,
  });
  if (result.exitCode) {
    log(`${result.stdout}\n${result.stderr}\n`);
    console.log(
      chalk.red(`\nCommand execution failed, Code "${result.exitCode}"`),
    );
    process.exit(1);
  }
  return result;
}

async function release(releaseType: ReleaseType) {
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
  await run('git', ['push', '--tags']);

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
  await run('git', ['add', '--all']);
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

if (args.beta) {
  type = 'prerelease';
} else if (args.minor) {
  type = 'minor';
} else if (args.major) {
  type = 'major';
}

release(type);
