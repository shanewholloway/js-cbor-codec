import rpi_jsy from 'rollup-plugin-jsy'
import rpi_dgnotify from 'rollup-plugin-dgnotify'
import rpi_resolve from '@rollup/plugin-node-resolve'
import { terser as rpi_terser } from 'rollup-plugin-terser'

import pkg from './package.json'
const pkg_name = pkg.name.replace('-', '_')

const external = id => /^\w+:/.test(id)
const plugins = [
  rpi_dgnotify(),
  rpi_jsy(),
  rpi_resolve({main: true, modules: true}),
]
let is_watch = process.argv.includes('--watch')
const plugins_min = !is_watch && [...plugins, rpi_terser({}) ]

export default [

  ... add_jsy('index'),
  ... add_jsy('full'),
  ... add_jsy('encode'),
  ... add_jsy('encode_full'),
  ... add_jsy('decode'),
  ... add_jsy('decode_async'),
  ... add_jsy('decode_full'),
  ... add_jsy('float16'),

  // publish leveldb as package that reuses other modules
  {
    input: `code/leveldb.jsy`,
    plugins,
    output: [
      { file: `cjs/leveldb.cjs`, format: 'cjs', exports:'default', sourcemap: true },
      { file: `esm/leveldb.mjs`, format: 'es', sourcemap: true },
  ]},

  // unit test outputs
  { input: `./test/unittest.jsy`, plugins, external,
    output: { file: './test/dist/mocha_unittest.cjs.js', format: 'cjs', sourcemap: false } },

  { input: `./test/unittest.jsy`, context: 'window', plugins, external,
    output: { file: './test/dist/browser_unittest.iife.js', format: 'iife', name: `test_cbor_codec`, sourcemap: false } },
]


function * add_jsy(src_name, opt={}) {
  let module_name = opt.module_name || `${pkg_name}_${src_name}`

  yield {
    input: `code/${src_name}.jsy`,
    plugins, external,
    output: [
      { file: `esm/${src_name}.mjs`, format: 'es', sourcemap: true },
      { file: `cjs/${src_name}.cjs`, format: 'cjs', exports:'named', sourcemap: true },
      { file: `umd/${src_name}.js`, format: 'umd', name:module_name, exports:'named', sourcemap: true },
    ]}

  if (plugins_min)
    yield {
      input: `code/${src_name}.jsy`,
      plugins: plugins_min, external,
      output: [
        { file: `esm/${src_name}.min.mjs`, format: 'es' },
        { file: `umd/${src_name}.min.js`, format: 'umd', name:module_name, exports:'named' },
      ]}
}
