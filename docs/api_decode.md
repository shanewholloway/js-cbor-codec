### CBOR Decode

- `cbor_decode(u8)` decodes a CBOR encoded data frame into objects and values.
- `cbor_iter_decode(u8)` decodes one or more CBOR encoded data frames into objects and values as a generator.
- `class CBORDecoder`
- `decode(u8)` is an alias for `cbor_decode`
- `iter_decode(u8)` is an alias for `cbor_iter_decode`

#### Example

- See [demo_decode.mjs](../examples/demo_decode.mjs)
- See [demo_iter.mjs](../examples/demo_iter.mjs)


#### Use from NodeJS

```javascript
import {cbor_decode} from "cbor-codec"
import {cbor_decode} from "cbor-codec/esm/decode.mjs"
import cbor_decode from "cbor-codec/esm/decode.mjs"
```

#### Use from Web or Deno

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

#### Sample Code

```javascript
let demo_data_u8 = hex_to_u8(
  'a27164656d6f5f63626f725f737570706f7274c1fb' +
  '41d6fbc6534000006c736f6d655f6e756d62657273' +
  '5820db0f4940f304b53ff304353f8e5d1340187231' +
  '3f54f82d40d95bde3e3baab83f')

console.log(cbor_decode(demo_data_u8))
```
