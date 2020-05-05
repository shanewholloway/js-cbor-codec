import rpi_jsy from 'rollup-plugin-jsy-lite'
import rpi_resolve from '@rollup/plugin-node-resolve'
import { terser as rpi_terser } from 'rollup-plugin-terser'

import pkg from './package.json'
const pkg_name = pkg.name.replace('-', '_')

const configs = []
export default configs

const sourcemap = true
const external = []

const plugins = [ rpi_jsy(), rpi_resolve({main: true, modules: true}), ]
const plugins_min = [...plugins, rpi_terser({}) ]


add_jsy('index')
add_jsy('full')
add_jsy('encode')
add_jsy('encode_full')
add_jsy('decode')
add_jsy('float16')

// publish leveldb as package that reuses other modules
configs.push({
  input: `code/leveldb.jsy`,
  plugins, external: ()=>true,
  output: [
    { file: `cjs/leveldb.cjs`, format: 'cjs', exports:'default', sourcemap },
    { file: `esm/leveldb.mjs`, format: 'es', sourcemap },
]})


function add_jsy(src_name, opt={}) {
  let module_name = opt.module_name || `${pkg_name}_${src_name}`

  configs.push({
    input: `code/${src_name}.jsy`,
    plugins, external,
    output: [
      { file: `esm/${src_name}.mjs`, format: 'es', sourcemap },
      { file: `cjs/${src_name}.cjs`, format: 'cjs', exports:'named', sourcemap },
      { file: `umd/${src_name}.js`, format: 'umd', name:module_name, exports:'named', sourcemap },
    ]})

  if (plugins_min)
    configs.push({
      input: `code/${src_name}.jsy`,
      plugins: plugins_min, external,
      output: [
        { file: `esm/${src_name}.min.mjs`, format: 'es' },
        { file: `umd/${src_name}.min.js`, format: 'umd', name:module_name, exports:'named' },
      ]})
}
