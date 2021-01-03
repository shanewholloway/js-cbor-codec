# cbor-codec API

- [CBOR-259 explicit maps](./CBOR-259-spec--explicit-maps.md)
- [LevelDB/LevelDown codec support](./leveldown.md).


### Decode

- `cbor_decode(u8)` decodes a CBOR encoded data frame into objects and values.
- `cbor_iter_decode(u8)` decodes one or more CBOR encoded data frames into objects and values as a generator.
- `class CBORDecoder`
- `decode(u8)` is an alias for `cbor_decode`
- `iter_decode(u8)` is an alias for `cbor_iter_decode`

```javascript
import {cbor_decode} from "cbor-codec"
import {cbor_decode} from "cbor-codec/esm/decode.mjs"
import cbor_decode from "cbor-codec/esm/decode.mjs"
```

```html
<script type=module>
  import {cbor_decode, cbor_iter_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  import {cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode.mjs"
  import {cbor_iter_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode.mjs"

  // minified
  import {cbor_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode.min.mjs"
  import {cbor_iter_decode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode.min.mjs"
</script>
```

```
let demo_data_u8 = hex_to_u8(
  'a27164656d6f5f63626f725f737570706f7274c1fb' +
  '41d6fbc6534000006c736f6d655f6e756d62657273' +
  '5820db0f4940f304b53ff304353f8e5d1340187231' +
  '3f54f82d40d95bde3e3baab83f')

console.log(cbor_decode(demo_data_u8))
```

### Async Decode

- `cbor_decode_stream(u8_stream)` decodes a CBOR encoded data frame from an async iterator stream into objects and values.
- `cbor_aiter_decode_stream(u8_stream)` decodes one or more CBOR encoded data frames from an async iterator stream into objects and values as an async generator.
- `class CBORAsyncDecoder`
- `decode_stream(u8_stream)` is an alias for `cbor_decode_stream`
- `aiter_decode_stream(u8_stream)` is an alias for `cbor_aiter_decode_stream`

```javascript
import {cbor_decode_stream} from "cbor-codec"
import {cbor_decode_stream} from "cbor-codec/esm/decode_async.mjs"

import {cbor_aiter_decode_stream} from "cbor-codec"
import {cbor_aiter_decode_stream} from "cbor-codec/esm/decode_async.mjs"
```

```html
<script type=module>
  import {cbor_decode_stream, cbor_aiter_decode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  import {cbor_decode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode_async.mjs"
  import {cbor_aiter_decode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode_async.mjs"

  // minified
  import {cbor_decode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode_async.min.mjs"
  import {cbor_aiter_decode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/decode_async.min.mjs"
</script>
```

```
async function * demo_u8_stream() {
  yield hex_to_u8('a27164656d6f5f63626f725f737570706f7274c1fb')
  yield hex_to_u8('41d6fbc6534000006c736f6d655f6e756d62657273')
  yield hex_to_u8('5820db0f4940f304b53ff304353f8e5d1340187231')
  yield hex_to_u8('3f54f82d40d95bde3e3baab83f')
}

let u8_stream = demo_u8_stream()
console.log(await cbor_decode_stream(u8_stream))

// or using an async iterable:

let u8_stream = demo_u8_stream()
let obj_stream = cbor_aiter_decode_stream(u8_stream)
for await (let each of obj_stream)
  console.log(each)
```

### Encode

- `cbor_encode(value[, options])` encodes objects and values into a CBOR encoded data frame.
- `class CBOREncoder`
- `encode(value[, options])` is an alias for `cbor_encode()

```javascript
import {cbor_encode} from "cbor-codec"
import {cbor_encode} from "cbor-codec/esm/encode.mjs"
import cbor_encode from "cbor-codec/esm/encode.mjs"
```

```html
<script type=module>
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.mjs"

  // minified
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.min.mjs"
</script>
```

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

### Encode Full

Extends the standard `CBOREncoder` to use `.toCBOR()` and `.toJSON()` extension points,
as well as support for iterables into CBOR array streams.

- `cbor_encode(value[, options])` encodes objects and values into a CBOR encoded data frame.
- `class CBOREncoderFull`
- `encode(value[, options])` is an alias for `cbor_encode()

```javascript
import {cbor_encode} from "cbor-codec/esm/encode_full.mjs"
import cbor_encode from "cbor-codec/esm/encode_full.mjs"
```

```html
<script type=module>
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode_full.mjs"

  // minified
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode_full.min.mjs"
</script>
```


### Utilities

- `hex_to_u8(hex : string) : Uint8Array` decodes a hex-encoded string into an `Uint8Array`. Cross platform.
- `u8_to_hex(u8 : Uint8Array) : string` encodes an `Uint8Array` into a hex-encoded string. Cross platform.
- `u8_to_utf8(u8 : Uint8Array) : string` decodes an `Uint8Array` into an UTF-8 string. Cross platform.
- `utf8_to_u8(sz : string) : Uint8Array` encodes a UTF-8 string into an `Uint8Array`. Cross platform.
- `u8_concat(parts : Array<Uint8Array>)` concatenates one or more `Uint8Array`.
- `as_u8_buffer(u8 : Uint8Array | Buffer) : Uint8Array` adapts parameter into an `Uint8Array`

```html
<script type=module>
  import {
    hex_to_u8, u8_to_hex,
    u8_to_utf8, utf8_to_u8,
    u8_concat, as_u8_buffer,
  } from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"
</script>
```
