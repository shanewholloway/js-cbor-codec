import rpi_jsy from 'rollup-plugin-jsy-lite'
import rpi_resolve from 'rollup-plugin-node-resolve'

import pkg from './package.json'
const pkg_name = pkg.name.replace('-', '_')

const configs = []
export default configs

const sourcemap = true
const external = []

const plugins = [ rpi_resolve({main: true, modules: true}), ]
const plugins_nodejs = [ rpi_jsy({defines: {PLAT_NODEJS: true}}) ].concat(plugins)
const plugins_web = [ rpi_jsy({defines: {PLAT_WEB: true}}) ].concat(plugins)

import { terser as rpi_terser } from 'rollup-plugin-terser'
const plugins_min = plugins_web.concat([ rpi_terser({}) ])


add_jsy('index', true)
add_jsy('cbor_decode')
add_jsy('cbor_encode')
add_jsy('half_float')


function add_jsy(src_name, inc_min) {
  const module_name = inc_min ? pkg_name : `${pkg_name}-${src_name}`

  if (plugins_nodejs)
    configs.push({
      input: `code/${src_name}.jsy`,
      plugins: plugins_nodejs, external,
      output: [
        { file: `cjs/${src_name}.js`, format: 'cjs', exports:'named', sourcemap },
        { file: `esm/${src_name}.js`, format: 'es', sourcemap } ]})

  if (plugins_web)
    configs.push({
      input: `code/${src_name}.jsy`,
      plugins: plugins_web, external,
      output: [
        { file: `umd/${src_name}${inc_min ? '.dbg' : ''}.js`, format: 'umd', name:module_name, exports:'named', sourcemap },
        { file: `esm/web/${src_name}.js`, format: 'es', sourcemap } ]})

  if (inc_min && 'undefined' !== typeof plugins_min)
    configs.push({
      input: `code/${src_name}.jsy`,
      plugins: plugins_min, external,
      output: { file: `umd/${src_name}.min.js`, format: 'umd', name:module_name, exports:'named' }})
}
