### CBOR Encode Full

Extends the standard `CBOREncoder` to use `.toCBOR()` and `.toJSON()` extension points,
as well as support for iterables into CBOR array streams.

- `cbor_encode(value[, options])` encodes objects and values into a CBOR encoded data frame.
- `class CBOREncoderFull`
- `encode(value[, options])` is an alias for `cbor_encode()
- `cbor_encode_stream(outstream)` returns a bound `cbor_encode(value[, options])` function that outputs to `outstream`.
- `encode_stream(outstream)` is an alias for `cbor_encode_stream()`


#### Use from NodeJS

```javascript
import {cbor_encode} from "cbor-codec/esm/encode_full.mjs"
import cbor_encode from "cbor-codec/esm/encode_full.mjs"
```

#### Use from Web or Deno

```html
<script type=module>
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode_full.mjs"

  // minified
  import {cbor_encode} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode_full.min.mjs"
</script>
```
