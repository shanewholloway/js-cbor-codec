### CBOR with Custom Tags

Extension point methods / overrides:
 - `to_cbor_encode(cbor_encode_ctx) {}`
 - `static from_cbor_decode(tags_lut, cbor_accum) {}`

Extension utilities:
 - `cbor_accum({init() {}, accum(res, k, v) {}, done(res) {}})`
 - `cbor_decode_ctx.use_overlay()` to override `{list}` or `{map}` types


#### Example

- [exampels/demo_custom_tags.mjs](../examples/demo_custom_tags.mjs)
- [exampels/demo_tag_tbd279.mjs](../examples/demo_tag_tbd279.mjs)
  implementing [Ordered Maps for CBOR](https://github.com/Sekenre/cbor-ordered-map-spec/blob/master/CBOR_Ordered_Map.md)


#### See the source

Container types use `cbor_accum()` to adapt CBOR encodings into expected JavaScript datatypes.
See [`decode_common/types.jsy`](../code/decode_common/types.jsy) for details.

CBOR extensions can also use `cbor_accum()` and `ctx.use_overlay({...})` to override CBOR decoding.
See [Sets 258][] and [Maps 259][] extension implementation in [`decode_common/basic_tags.jsy`](../code/decode_common/basic_tags.jsy) for details.

  [Sets 258]: https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
  [Maps 259]: https://github.com/shanewholloway/js-cbor-codec/blob/master/docs/CBOR-256-spec--explicit-maps.md


#### Encoding with cbor-codec

```javascript
import { cbor_encode } from 'cbor-codec'

class DemoPIDay {
  constructor(pie) { this.pie = pie }
  // ...

  to_cbor_encode(enc_ctx) {
    enc_ctx.tag_encode_object(3141592, this)
  }
}

let u8_demo = cbor_encode(new DemoPIDay('apple'))
// in hex: 'da002fefd8a163706965656170706c65'
```

#### Decoding with cbor-codec

```javascript
class DemoPIDay {
  constructor(pie) { this.pie = pie }
  // ...

  static from_cbor_decode(tag_map) {
    const klass = this /* DemoPIDay */
    const demo_cbor_pie = () =>
      obj => new klass(obj.pie)

    tag_map.set(3141592, demo_cbor_pie)
  }
}

const CBORCustom = CBORDecoder
  .options({tags: [DemoPIDay]})

let u8_demo = hex_to_u8('da002fefd8a163706965656170706c65')
let obj = CBORCustom.decode(u8_demo)
// DemoPIDay { pie: 'apple' }
```

