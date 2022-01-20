import {
  hex_to_u8, u8_to_hex,
  cbor_encode,
  cbor_decode,
  cbor_decode_stream,
  CBORDecoder,
} from 'cbor-codec'

function with_shared(x) {
  x.to_cbor_encode = (ctx, v) => ctx.shared_object(v)
  return x }

let a = with_shared({})
let b = with_shared({b:'B'})

let u8 = cbor_encode([a,a,b,a,b])

console.log('u8 hex', u8_to_hex(u8))

let u8_aa = cbor_encode([a,a])
console.log('u8 [a,a] len: %s hex: %o', u8_aa.byteLength, u8_to_hex(u8_aa))

let rt_sync = cbor_decode(u8)
console.log('rt_sync', rt_sync, rt_sync[1] === rt_sync[3], rt_sync[2] === rt_sync[4])

let rt_async = await cbor_decode_stream(u8)
console.log('rt_async:', rt_async, rt_async[1] === rt_async[3], rt_sync[2] === rt_sync[4])

