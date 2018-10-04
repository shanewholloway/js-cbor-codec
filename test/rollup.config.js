import rpi_resolve from 'rollup-plugin-node-resolve'
import rpi_jsy from 'rollup-plugin-jsy-lite'

const sourcemap = 'inline'
const plugins = [
  rpi_resolve({main: true, modules: true}),
]

const plugins_nodejs = [ rpi_jsy({defines: {PLAT_NODEJS: true}}) ].concat(plugins)
const plugins_web = [ rpi_jsy({defines: {PLAT_WEB: true}}) ].concat(plugins)


export default [
  { input: `./unittest.jsy`, plugins: plugins_nodejs,
    output: { file: './__unittest.cjs.js', format: 'cjs', sourcemap } },

  { input: `./unittest.jsy`, context: 'window', plugins: plugins_web,
    output: { file: './__unittest.iife.js', format: 'iife', name: `test_cbor_codec`, sourcemap } },
]
