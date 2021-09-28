# CBOR Codec

[![Node.js CI](https://github.com/shanewholloway/js-cbor-codec/actions/workflows/node-ci.yml/badge.svg)](https://github.com/shanewholloway/js-cbor-codec/actions/workflows/node-ci.yml)

CBOR Codec for NodeJS and the Web.

[CBOR-259 explicit maps](./docs/CBOR-259-spec--explicit-maps.md)

## Demo

[Live demo](https://shanewholloway.github.io/js-cbor-codec/index.html)


## Use

from NodejS,

```javascript
import {cbor_encode, cbor_decode} from "cbor-codec"

const demo_data = {
  demo_cbor_support: new Date('2018-11-16T12:23:57-0700'),
  some_numbers: new Float32Array([
    Math.PI, Math.SQRT2, Math.SQRT1_2,
    Math.LN10, Math.LN2, Math.E, Math.LOG10E, Math.LOG2E ])}

let demo_u8 = cbor_encode(demo_data)
console.log(demo_u8)

console.log(cbor_decode(demo_data_u8))
```

or direclty from HTML,

```html
<script type='module'>
  import {cbor_encode, cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  const demo_data = {
    demo_cbor_support: new Date('2018-11-16T12:23:57-0700'),
    some_numbers: new Float32Array([
      Math.PI, Math.SQRT2, Math.SQRT1_2,
      Math.LN10, Math.LN2, Math.E, Math.LOG10E, Math.LOG2E ])}

  let demo_u8 = cbor_encode(demo_data)
  console.log(demo_u8)

  console.log(cbor_decode(demo_data_u8))
</script>
```

## Docs

See the [API docs](./docs/api.md).


### Overview

From NodeJS,

```sh
npm install cbor-codec
```

or in HTML,

```html
<script type='module'>
  import {cbor_encode, cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.mjs"
  import {cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode.mjs"

  // minified
  import {cbor_encode, cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.min.mjs"
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.min.mjs"
  import {cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode.min.mjs"
</script>
```

### Decoding CBOR

```javascript
let demo_data_u8 = hex_to_u8(
  'a27164656d6f5f63626f725f737570706f7274c1fb' +
  '41d6fbc6534000006c736f6d655f6e756d62657273' +
  'd8555820db0f4940f304b53ff304353f8e5d134018' +
  '72313f54f82d40d95bde3e3baab83f')

console.log(cbor_decode(demo_data_u8))
```

See the [API docs](./docs/api.md) for async streaming and custom CBOR tag decodings.


### Encoding CBOR

```javascript
const demo_data = {
  demo_cbor_support: new Date('2018-11-16T12:23:57-0700'),
  some_numbers:
    new Float32Array([
      Math.PI, Math.SQRT2, Math.SQRT1_2,
      Math.LN10, Math.LN2, Math.E, Math.LOG10E, Math.LOG2E ]),
}

let demo_u8 = cbor_encode(demo_data)
console.log('cbor_encoded[u8]:', demo_u8)
console.log('cbor_encoded[hex]:', u8_to_hex(demo_u8))
```

See the [API docs](./docs/api.md) for output streaming and custom CBOR tag encodings.


### LevelDB / LevelDown CBOR Codec

Use CBOR for [LevelDB/LevelDown codec](./docs/leveldown.md).


## Unit tests

Mocha-based unittests:
- [Browser unittests](https://shanewholloway.github.io/js-cbor-codec/unittest.html)
- [NodeJS unittests](https://github.com/shanewholloway/js-cbor-codec/actions?query=workflow%3A%22Node.js+CI%22)


## License

[BSD 2-clause](./LICENSE)
