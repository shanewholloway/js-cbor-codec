import {
  hex_to_u8, u8_to_hex,
  cbor_encode,
  cbor_decode,
  CBORDecoder,
} from 'cbor-codec'


class DemoPIDay {
  constructor(pie) {
    this.pie = pie
  }

  to_cbor_encode(enc_ctx) {
    enc_ctx.tag_encode_object(3141592, this)
  }

  static from_cbor_decode(tag_map) {
    const klass = this /* DemoPIDay */
    const demo_cbor_pie = () =>
      obj => new klass(obj.pie)

    tag_map.set(3141592, demo_cbor_pie)
  }
}




let known_hex = 'da002fefd8a163706965656170706c65'
let known_u8 = hex_to_u8(known_hex)


{ // demo encoding
  console.log()
  console.log("Use to_cbor_encode(ctx) callback to write tagged value:")
  let u8 = cbor_encode(new DemoPIDay('apple'))

  let hex = u8_to_hex(u8)

  console.log('Hex:', {hex, matches: known_hex == hex})
  console.log('U8:', u8)
  console.log()
}


{ // demo standard decoding
  console.log()
  console.log("Use CBOR standard decoding to read tagged value")

  let v_default = cbor_decode(known_u8)
  console.log('Default Decode:', v_default)

  let u8 = cbor_encode(v_default)
  let hex = u8_to_hex(u8)

  console.log('Hex:', {hex, matches: known_hex == hex})
  //console.log('U8:', u8)
  console.log()
}


{ // demo custom decoding
  console.log()
  console.log("Use CBOR custom tags to read tagged value")

  const CBORCustom = CBORDecoder
    .options({tags: [DemoPIDay]})

  let v_custom = CBORCustom.decode(known_u8)
  console.log('Custom Decode:', v_custom)

  let u8 = cbor_encode(v_custom)
  let hex = u8_to_hex(u8)

  console.log('Hex:', {hex, matches: known_hex == hex})
  //console.log('U8:', u8)
  console.log()
}
