import {cbor_aiter_decode_stream, hex_to_u8} from 'cbor-codec'

let demo_data_u8 = hex_to_u8(`
  a2627473c1fb41d6fbc6ae0000006872656164696e677348db0f494083f9a23e
  a2627473c1fb41d6fbca320000006872656164696e677348f304b53ff304353f
  a2627473c1fb41d6fbcdb60000006872656164696e6773488e5d1340d95bde3e
  a2627473c1fb41d6fbd13a0000006872656164696e6773481872313f3baab83f
  a2627473c1fb41d6fbd4be0000006872656164696e67734854f82d40b25abc3e
  a2627473c1fb41d6fbd8420000006872656164696e677348d95bde3e8e5d1340
  a2627473c1fb41d6fbdbc60000006872656164696e6773483baab83f1872313f`)


async function * demo_stream(u8_data, frame_size=8) {
  for (let i=0; i<u8_data.byteLength; i += frame_size)
    yield u8_data.slice(i, i+frame_size)
}

async function demo_main(u8_stream) {
  let obj_stream = cbor_aiter_decode_stream(u8_stream)
  for await (let each of obj_stream)
    console.log("aiter_decode_stream obj:", each)
}

demo_main( demo_stream(demo_data_u8) )
