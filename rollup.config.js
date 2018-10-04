import rpi_jsy from 'rollup-plugin-jsy-lite'

const configs = []
export default configs

const sourcemap = true
const external = []

const plugins = []
const plugins_nodejs = [ rpi_jsy({defines: {PLAT_NODEJS: true}}) ].concat(plugins)
const plugins_web = [ rpi_jsy({defines: {PLAT_WEB: true}}) ].concat(plugins)
const plugins_min = null // plugins_web.slice()

//import { terser as rpi_terser } from 'rollup-plugin-terser'
//plugins_min.push(rpi_terser({}))


add_jsy('index')
add_jsy('cbor_decode')
add_jsy('cbor_encode')


function add_jsy(name) {
  if (plugins_nodejs)
    configs.push({
      input: `code/${name}.jsy`,
      plugins: plugins_nodejs, external,
      output: [
        { file: `cjs/${name}.js`, format: 'cjs', exports:'named', sourcemap },
        { file: `esm/${name}.js`, format: 'es', sourcemap } ]})

  if (plugins_web)
    configs.push({
      input: `code/${name}.jsy`,
      plugins: plugins_web, external,
      output: [
        { file: `umd/${name}.dbg.js`, format: 'umd', name, exports:'named', sourcemap },
        { file: `esm/web/${name}.js`, format: 'es', sourcemap } ]})

  if (plugins_min)
    configs.push({
      input: `code/${name}.jsy`,
      plugins: plugins_min, external,
      output: { file: `umd/${name}.min.js`, format: 'umd', name, exports:'named', sourcemap }})
}
