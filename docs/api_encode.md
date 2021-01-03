### CBOR Encode

- `cbor_encode(value[, options])` encodes objects and values into a CBOR encoded data frame.
- `class CBOREncoder`
- `encode(value[, options])` is an alias for `cbor_encode()
- `cbor_encode_stream(outstream)` returns a bound `cbor_encode(value[, options])` function that outputs to `outstream`.
- `encode_stream(outstream)` is an alias for `cbor_encode_stream()`

#### Example

See [demo_encode.mjs](../examples/demo_encode.mjs)

#### Use from NodeJS

```javascript
import {cbor_encode} from "cbor-codec"
import {cbor_encode} from "cbor-codec/esm/encode.mjs"
import cbor_encode from "cbor-codec/esm/encode.mjs"
```

#### Use from Web or Deno

```html
<script type=module>
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.mjs"

  // minified
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.min.mjs"
</script>
```

#### Sample Code

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

