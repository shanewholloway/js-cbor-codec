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


async function * demo_out_aiter() {
  console.log("demo_out_aiter:", "READY")
  while (1) {
    let u8 = (yield)
    await console.log("demo_out_aiter:", "SEND:", u8)
  }
}


async function demo_main(data_seq, aiter_out) {
  let _cbor_encode = cbor_encode_stream(aiter_out)

  for (let data of data_seq) {
    await _cbor_encode(data)
  }
}


{
  console.log('creating demo_out_aiter')
  let _demo_out = demo_out_aiter()
  console.log('')

  console.log('priming demo_out_aiter')
  _demo_out.next()
  console.log('')

  console.log('calling demo_main()')
  demo_main(demo_data_seq, _demo_out)
}

