import {cbor_decode, hex_to_u8} from 'cbor-codec'

let demo_data_u8 = hex_to_u8(
  'a27164656d6f5f63626f725f737570706f7274c1fb' +
  '41d6fbc6534000006c736f6d655f6e756d62657273' +
  '5820db0f4940f304b53ff304353f8e5d1340187231' +
  '3f54f82d40d95bde3e3baab83f')

console.log(cbor_decode(demo_data_u8))
