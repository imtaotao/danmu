import chalk from 'chalk';
import minimist from 'minimist';

export const args = minimist(process.argv.slice(2));

export const log = (msg: string) => console.log(chalk.cyan(msg));

export const warn = (msg: string) => console.log(chalk.red(msg));

export const run = async (bin: string, args: Array<string>, opts = {}) => {
  const { execa } = await import('execa');
  const result = await execa(bin, args, {
    stdio: 'pipe',
    cwd: process.cwd(),
    ...opts,
  });
  if (result.exitCode) {
    log(`${result.stdout}\n${result.stderr}\n`);
    warn(`\nCommand execution failed, Status Code "${result.exitCode}"`);
    process.exit(1);
  }
  return result;
};
