const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const rm = require('rimraf').sync
const babel = require('rollup-plugin-babel')
const cmd = require('rollup-plugin-commonjs')
const cleanup = require('rollup-plugin-cleanup')
const resolve = require('rollup-plugin-node-resolve')

const version = require('./package.json').version
const entryPath = path.resolve(__dirname, './src/index.js')
const outputPath = filename => path.resolve(__dirname, './dist', filename)

const banner =
  '/*!\n' +
  ` * Danmuku.js v${version}\n` +
  ` * (c) 2019-${new Date().getFullYear()} Imtaotao\n` +
  ' * Released under the MIT License.\n' +
  ' */'

const esm = {
  input: entryPath,
  output: {
    banner,
    format: 'es',
    file: outputPath('danmuku.esm.js'),
  }
}

const umd = {
  input: entryPath,
  output: {
    banner,
    format: 'umd',
    name: 'Danmuku',
    file: outputPath('danmuku.min.js'),
  }
}

const cjs = {
  input: entryPath,
  output: {
    banner,
    format: 'cjs',
    file: outputPath('danmuku.common.js'),
  }
}

async function build (cfg, sourcemap = false) {
  cfg.output.sourcemap = sourcemap

  const bundle = await rollup.rollup({
    input: cfg.input,
    plugins: [
      cleanup(),
      resolve(),
      babel({
        babelrc: true,
        exclude: 'node_modules/**',
      }),
      cmd(),
    ]
  })
  await bundle.generate(cfg.output)
  await bundle.write(cfg.output)
}

console.clear()
// delete old build files
rm('./dist')

const buildVersion = sourcemap => {
  build(esm, sourcemap)
  build(cjs, sourcemap)
  build(umd, sourcemap)
}

// watch, use in dev and test
if (process.argv.includes('-w')) {
  let i = 0
  fs.watch('./src', () => {
    console.clear()
    console.log('Rebuild: ' + ++i)
    buildVersion(true)
  })
  buildVersion(true)
} else {
  buildVersion()
}