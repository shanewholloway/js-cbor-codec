import {cbor_encode, cbor_iter_decode, u8_to_hex, hex_to_u8} from 'cbor-codec'

const demo_data_seq = [
  { ts: new Date('2018-11-16T12:30:00-0700'), readings: new Float32Array([ Math.PI, 1.0 / Math.PI ]) },
  { ts: new Date('2018-11-16T13:30:00-0700'), readings: new Float32Array([ Math.SQRT2, Math.SQRT1_2 ]) },
  { ts: new Date('2018-11-16T14:30:00-0700'), readings: new Float32Array([ Math.LN10, 1.0 / Math.LN10 ]) },
  { ts: new Date('2018-11-16T15:30:00-0700'), readings: new Float32Array([ Math.LN2, 1.0 / Math.LN2 ]) },
  { ts: new Date('2018-11-16T16:30:00-0700'), readings: new Float32Array([ Math.E, 1.0 / Math.E ]) },
  { ts: new Date('2018-11-16T17:30:00-0700'), readings: new Float32Array([ Math.LOG10E, 1.0 / Math.LOG10E ]) },
  { ts: new Date('2018-11-16T18:30:00-0700'), readings: new Float32Array([ Math.LOG2E, 1.0 / Math.LOG2E ]) },
]

let demo_u8_seq = demo_data_seq
  .map(data => cbor_encode(data))
console.log('demo_u8_seq[u8]:', demo_u8_seq)

let demo_hex_seq = demo_u8_seq
  .map(u8_data => u8_to_hex(u8_data))
console.log('demo_hex_seq[hex]:', demo_hex_seq)

let demo_hex = demo_hex_seq.join('')

let known_hex = (
  'a2627473c1fb41d6fbc6ae0000006872656164696e677348db0f494083f9a23e' +
  'a2627473c1fb41d6fbca320000006872656164696e677348f304b53ff304353f' +
  'a2627473c1fb41d6fbcdb60000006872656164696e6773488e5d1340d95bde3e' +
  'a2627473c1fb41d6fbd13a0000006872656164696e6773481872313f3baab83f' +
  'a2627473c1fb41d6fbd4be0000006872656164696e67734854f82d40b25abc3e' +
  'a2627473c1fb41d6fbd8420000006872656164696e677348d95bde3e8e5d1340' +
  'a2627473c1fb41d6fbdbc60000006872656164696e6773483baab83f1872313f' )


if (demo_hex !== known_hex)
  throw new Error("Mismatch in CBOR encoding -- or maybe the demo changed...")


let i=0, known_u8 = hex_to_u8(known_hex)
for (let value of cbor_iter_decode(known_u8))
  console.log(`\niter_decode[${i++}]:`, value)

