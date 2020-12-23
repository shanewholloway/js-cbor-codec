import rpi_jsy from 'rollup-plugin-jsy-lite'
import rpi_resolve from '@rollup/plugin-node-resolve'

const plugins = [ rpi_jsy(), rpi_resolve() ]

export default [
  { input: `./unittest.jsy`, plugins,
    output: { file: './mocha_unittest.cjs.js', format: 'cjs', sourcemap: false } },

  { input: `./unittest.jsy`, context: 'window', plugins,
    output: { file: './browser_unittest.iife.js', format: 'iife', name: `test_cbor_codec`, sourcemap: false } },
]
