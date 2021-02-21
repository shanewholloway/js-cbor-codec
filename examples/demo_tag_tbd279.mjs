import {
  hex_to_u8, u8_to_hex,
  cbor_encode_sym, cbor_decode_sym,
  cbor_encode,
  cbor_decode,
  CBORDecoder,
} from 'cbor-codec'

let known_hex = 'd9011084616101616202'
let known_u8 = hex_to_u8(known_hex)

{ // demo standard decoding
  let v_default = cbor_decode(known_u8)
  console.log('Default Decode:', v_default)

  let u8 = cbor_encode(v_default)
  let hex = u8_to_hex(u8)

  console.log('Hex:', {hex, matches: known_hex == hex})
  //console.log('U8:', u8)
  console.log()
}

{ // demo custom decoding

  const custom_cbor = new CBORDecoder({tags: [tag_272]})

  let v_custom = custom_cbor.decode(known_u8)
  console.log('Custom Decode:', v_custom)

  let u8 = cbor_encode(v_custom)
  let hex = u8_to_hex(u8)

  console.log('Hex:', {hex, matches: known_hex == hex})
  //console.log('U8:', u8)
  console.log()
}


function tag_272(lut, cbor_accum) {
  class Map272 extends Map {
    [cbor_encode_sym](ctx) {
      const end_tag = ctx.tag(272)
      // flat array of pairs
      ctx.add_int(0x80, 2 * this.size)

      let {encode} = ctx
      for (const e of this.entries()) {
        encode(e[0])
        encode(e[1])
      }
      return end_tag()
    }
  }

  const tag_272_overlay = {
    list: cbor_accum({
      init: () => ({map: new Map272()}),

      accum(res, idx, e) {
        if (0 === (1 & idx))
          res.key = e // first of pair; remember key
        else
          res.map.set(res.key, e) // second of pair; set (k,v) pair
      },

      done: res => res.map,
    })
  }

  lut.set(272, ctx => { ctx.use_overlay(tag_272_overlay) })

  return Map272
}

