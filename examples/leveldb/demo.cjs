const cbor_leveldb = require('cbor-codec/leveldb')
const levelup = require('levelup')
const encoding_down = require('encoding-down')


const demo_data = {
  demo_cbor_support: new Date('2018-11-16T12:23:57-0700'),
  some_numbers:
    new Float32Array([
      Math.PI, 
      Math.SQRT2, Math.SQRT1_2, 
      Math.LN10, Math.LN2, 
      Math.E, Math.LOG10E, Math.LOG2E ]),
}

async function demo(backing_db) {
  let lvl_db = levelup(
    encoding_down(
      backing_db,
      {valueEncoding: cbor_leveldb}))

  await lvl_db.put('a cbor example', demo_data)

  let op_get = await lvl_db.get('a cbor example')
  console.dir(op_get)
  return op_get
}

// demo with lightweight memdown backing db
const memdown = require('memdown')
demo(memdown())


/* or using leveldown backing db:

const leveldown = require('leveldown')
demo(leveldown())

*/
