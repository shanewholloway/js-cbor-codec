### CBOR Async Decode

- `cbor_decode_stream(u8_stream)` decodes a CBOR encoded data frame from an async iterator stream into objects and values.
- `cbor_aiter_decode_stream(u8_stream)` decodes one or more CBOR encoded data frames from an async iterator stream into objects and values as an async generator.
- `class CBORAsyncDecoder`
- `decode_stream(u8_stream)` is an alias for `cbor_decode_stream`
- `aiter_decode_stream(u8_stream)` is an alias for `cbor_aiter_decode_stream`

#### Example

- See [demo_decode_stream.mjs](../examples/demo_decode_stream.mjs)
- See [demo_aiter_decode_stream.mjs](../examples/demo_aiter_decode_stream.mjs)


#### Use from NodeJS

```javascript
import {cbor_decode_stream} from "cbor-codec"
import {cbor_decode_stream} from "cbor-codec/esm/decode_async.mjs"

import {cbor_aiter_decode_stream} from "cbor-codec"
import {cbor_aiter_decode_stream} from "cbor-codec/esm/decode_async.mjs"
```

#### Use from Web or Deno

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

#### Sample Code

```javascript
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
