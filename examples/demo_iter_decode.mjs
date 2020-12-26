import {cbor_iter_decode, u8_to_hex, hex_to_u8, u8_concat} from 'cbor-codec'

let stored_data_part1 = hex_to_u8(
  'a2627473c1fb41d6fbc6ae0000006872656164696e677348db0f494083f9a23e' +
  'a2627473c1fb41d6fbca320000006872656164696e677348f304b53ff304353f' +
  'a2627473c1fb41d6fbcdb60000006872656164696e6773488e5d1340d95bde3e' +
  'a2627473c1fb41d6fbd13a000000' )

let stored_data_part2 = hex_to_u8(
                              '6872656164696e6773481872313f3baab83f' +
  'a2627473c1fb41d6fbd4be0000006872656164696e67734854f82d40b25abc3e' +
  'a2627473c1fb41d6fbd8420000006872656164696e677348d95bde3e8e5d1340' +
  'a2627473c1fb41d6fbdbc60000006872656164696e6773483baab83f1872313f' )


let u8_last = Uint8Array.from([])
for (let u8_part of [stored_data_part1, stored_data_part2]) {
  console.log('\n')
  console.log('U8 LAST:', u8_last)
  console.log('U8 PART:', u8_part)
  let u8_buf = u8_concat([u8_last, u8_part])

  let iterable = cbor_iter_decode(u8_buf)

  try {
    for (let value of iterable) {
      console.log("Frame", value)
    }
  } catch (e) {
    if (e.cbor_partial) {
      console.log("Incomplete frame:", u8_to_hex(e.cbor_partial.u8), e.cbor_partial)
      u8_last = e.cbor_partial.u8
    } else throw e
  }
}
