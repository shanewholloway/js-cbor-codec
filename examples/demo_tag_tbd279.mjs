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
}

{ // demo custom decoding

  function tag_272(lut) {
    let _cbor_as_272 = (ctx, a_map) =>
      ctx.tag_encode(272, Array.from(a_map.entries()).flat())

    let empty_272 = () =>
      Object.defineProperty(new Map(),
        cbor_encode_sym, {value: _cbor_as_272})

    const overlay = {
      empty_list: empty_272,
      list() { return this._272_map() },
      list_stream() { return this._272_map() },

      _272_map() {
        let k
        let res = _add.res = empty_272()
        return _add

        function _add(idx, e) {
          if (0 === (1 & idx))
            k = e // first of pair; remember key
          else
            res.set(k, e) // second of pair; set (k,v) pair
        }
      }
    }

    lut.set(272, ctx => {
      ctx.use_overlay(overlay)
    })
  }

  const custom_cbor = new CBORDecoder({tags: [tag_272]})

  let v_custom = custom_cbor.decode(known_u8)
  console.log('Custom Decode:', v_custom)

  let u8 = cbor_encode(v_custom)
  let hex = u8_to_hex(u8)

  console.log('Hex:', {hex, matches: known_hex == hex})
  //console.log('U8:', u8)
  console.log()
}
