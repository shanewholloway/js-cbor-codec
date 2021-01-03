### CBOR Encode Stream

- `cbor_encode_stream(outstream)` returns a bound `cbor_encode(value[, options])` function that outputs to `outstream`.
- `encode_stream(outstream)` is an alias for `cbor_encode_stream()`


#### Example

- See [demo_encode_stream.mjs](../examples/demo_encode_stream.mjs)
- See [demo_encode_custom_outstream.mjs](../examples/demo_encode_custom_outstream.mjs)


#### Use from NodeJS

```javascript
import {cbor_encode_stream} from "cbor-codec"
import {cbor_encode_stream} from "cbor-codec/esm/encode.mjs"

// or, if using CBOREncoderFull
import {cbor_encode_stream} from "cbor-codec/esm/encode_full.mjs"
```

#### Use from Web or Deno

```html
<script type=module>
  import {cbor_encode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"

  import {cbor_encode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.mjs"

  // minified
  import {cbor_encode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode.min.mjs"

  // or, if using CBOREncoderFull
  import {cbor_encode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode_full.mjs"

  // or minifed, if using CBOREncoderFull
  import {cbor_encode_stream} from "//cdn.jsdelivr.net/npm/cbor-codec/esm/encode_full.min.mjs"
</script>
```

#### Sample Code using Async Iterator outstream

```javascript
const demo_data_seq = [
  { ts: new Date('2018-11-16T12:30:00-0700'), readings: new Float32Array([ Math.PI, 1.0 / Math.PI ]) },
  { ts: new Date('2018-11-16T13:30:00-0700'), readings: new Float32Array([ Math.SQRT2, Math.SQRT1_2 ]) },
  { ts: new Date('2018-11-16T14:30:00-0700'), readings: new Float32Array([ Math.LN10, 1.0 / Math.LN10 ]) },
]

async function * demo_out_aiter() {
  console.log("demo_out_aiter:", "READY")
  while (1) {
    let u8 = (yield)
    await console.log("demo_out_aiter:", "SEND:", u8)
  }
}

async function demo_main(data_seq, aiter_out) {
  let _cbor_encode = cbor_encode_stream(aiter_out)

  for (let data of data_seq)
    await _cbor_encode(data)
}


let _demo_out = demo_out_aiter()
_demo_out.next()

demo_main(demo_data_seq, _demo_out)
```


#### Sample Code using outstream api

```javascript
let dbg_cbor_outstream = {
  block_size: 24, // optional block_size parameter

  write(u8_blk) {
    console.info('dbg_cbor_outstream', 'WRITE', u8_blk)
  },

  flush(blk) {
    console.info('dbg_cbor_outstream', 'FLUSH', u8_blk)
  },
}

demo_main(demo_data_seq, dbg_cbor_outstream)
```
