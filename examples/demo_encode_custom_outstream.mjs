import {cbor_encode_stream} from 'cbor-codec'

const demo_data_seq = [
  { ts: new Date('2018-11-16T12:30:00-0700'), readings: new Float32Array([ Math.PI, 1.0 / Math.PI ]) },
  { ts: new Date('2018-11-16T13:30:00-0700'), readings: new Float32Array([ Math.SQRT2, Math.SQRT1_2 ]) },
  { ts: new Date('2018-11-16T14:30:00-0700'), readings: new Float32Array([ Math.LN10, 1.0 / Math.LN10 ]) },
  { ts: new Date('2018-11-16T15:30:00-0700'), readings: new Float32Array([ Math.LN2, 1.0 / Math.LN2 ]) },
  { ts: new Date('2018-11-16T16:30:00-0700'), readings: new Float32Array([ Math.E, 1.0 / Math.E ]) },
  { ts: new Date('2018-11-16T17:30:00-0700'), readings: new Float32Array([ Math.LOG10E, 1.0 / Math.LOG10E ]) },
  { ts: new Date('2018-11-16T18:30:00-0700'), readings: new Float32Array([ Math.LOG2E, 1.0 / Math.LOG2E ]) },
]


async function demo_main(data_seq, aiter_out) {
  let _cbor_encode = cbor_encode_stream(aiter_out)

  for (let data of data_seq) {
    await _cbor_encode(data)
  }
}


{
  let dbg_cbor_outstream = {
    block_size: 24, // optional block_size parameter

    write(u8_blk) {
      console.info('dbg_cbor_outstream', 'WRITE', u8_blk)
    },

    flush(u8_blk) {
      console.info('dbg_cbor_outstream', 'FLUSH', u8_blk)
    },
  }

  demo_main(demo_data_seq, dbg_cbor_outstream)
}

