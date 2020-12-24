import {cbor_encode, cbor_decode, u8_to_hex, hex_to_u8} from 'cbor-codec'

const demo_data = {
  demo_cbor_support: new Date('2018-11-16T12:23:57-0700'),
  some_numbers:
    new Float32Array([
      Math.PI, 
      Math.SQRT2, Math.SQRT1_2, 
      Math.LN10, Math.LN2, 
      Math.E, Math.LOG10E, Math.LOG2E ]),
}

let demo_u8 = cbor_encode(demo_data)
console.log('cbor_encoded[u8]:', demo_u8)

let demo_hex = u8_to_hex(demo_u8)
console.log('cbor_encoded[hex]:', demo_hex)

let known_hex = (
  'a27164656d6f5f63626f725f737570706f7274c1fb' +
  '41d6fbc6534000006c736f6d655f6e756d62657273' +
  '5820db0f4940f304b53ff304353f8e5d1340187231' +
  '3f54f82d40d95bde3e3baab83f')

console.log('Matching known:', demo_hex === known_hex)

console.log('Known decoded:', cbor_decode(hex_to_u8(known_hex)))

console.log('Round-trip decoded:', cbor_decode(hex_to_u8(demo_hex)))
