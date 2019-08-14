const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const rm = require('rimraf').sync
const babel = require('rollup-plugin-babel')
const cmd = require('rollup-plugin-commonjs')
const cleanup = require('rollup-plugin-cleanup')
const resolve = require('rollup-plugin-node-resolve')

const entryPath = path.resolve(__dirname, './src/index.js')
const outputPath = filename => path.resolve(__dirname, './dist', filename)

const esm = {
  input: entryPath,
  output: {
    file: outputPath('barrage.esm.js'),
    format: 'es',
  }
}

const umd = {
  input: entryPath,
  output: {
    file: outputPath('barrage.min.js'),
    format: 'umd',
    name: 'Barrage',
  }
}

const cjs = {
  input: entryPath,
  output: {
    file: outputPath('barrage.common.js'),
    format: 'cjs',
  }
}

async function build (cfg, sourcemap = false) {
  cfg.output.sourcemap = sourcemap

  const bundle = await rollup.rollup({
    input: cfg.input,
    plugins: [
      cleanup(),
      resolve(),
      // babel({
      //   babelrc: true,
      //   exclude: 'node_modules/**',
      // }),
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
    console.log('Rebuild times: ' + ++i)
    buildVersion(true)
  })
  buildVersion(true)
} else {
  buildVersion()
}