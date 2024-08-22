import path from "node:path";
import ts from "typescript";
import json from "@rollup/plugin-json";
import cleanup from "rollup-plugin-cleanup";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json" with { type: "json" };

const { dirname: __dirname } = import.meta;

const banner =
  "/*!\n" +
  ` * ${pkg.name}.js\n` +
  ` * (c) 2019-${new Date().getFullYear()} Imtaotao\n` +
  " * Released under the MIT License.\n" +
  " */";

const outputConfigs = {
  cjs: {
    format: "cjs",
    file: path.resolve(__dirname, "dist/danmu.cjs.js"),
  },
  "esm-bundler-js": {
    format: "es",
    file: path.resolve(__dirname, "dist/danmu.esm-bundler.js"),
  },
  "esm-bundler-mjs": {
    format: "es",
    file: path.resolve(__dirname, "dist/danmu.esm-bundler.mjs"),
  },
  umd: {
    format: "umd",
    file: path.resolve(__dirname, "dist/danmu.umd.js"),
  },
};

if (process.env.BUILD === 'development') {
  Object.keys(outputConfigs).forEach(key => {
    if (key !== 'esm-bundler-js') {
      delete outputConfigs[key];
    }
  })
}

const packageConfigs = Object.keys(outputConfigs).map((format) =>
  createConfig(format, outputConfigs[format]),
);

function createConfig(format, output) {
  let nodePlugins = [];
  const isUmdBuild = /umd/.test(format);
  const input = path.resolve(__dirname, "./src/index.ts");
  const external =
    isUmdBuild || !pkg.dependencies ? [] : Object.keys(pkg.dependencies);

  output.banner = banner;
  output.externalLiveBindings = true;
  if (isUmdBuild) output.name = "Danmu";

  if (format !== "cjs") {
    nodePlugins = [
      nodeResolve({ browser: isUmdBuild }),
      commonjs({ sourceMap: false }),
    ];
  }

  return {
    input,
    output,
    external,
    plugins: [
      cleanup(),
      json({
        namedExports: false,
      }),
      typescript({
        clean: true, // no cache
        typescript: ts,
        tsconfig: path.resolve(__dirname, "./tsconfig.json"),
      }),
      replace({
        __TEST__: `false`,
        __VERSION__: `'${pkg.version}'`,
        preventAssignment: true,
      }),
      ...nodePlugins,
    ],
  };
}

export default packageConfigs;
