### LevelDB encoding using cbor-codec

See [examples/leveldb/demo.cjs](../examples/leveldb/demo.cjs).


```javascript
const levelup = require('levelup')
const leveldown = require('leveldown')
const encoding_down = require('encoding-down')
const cbor_leveldb = require('cbor-codec/leveldb')

const lvl_db = levelup(
  encoding_down(
    leveldown(),
    { valueEncoding: cbor_leveldb })

// or

const lvl_db = levelup(
  encoding_down(
    leveldown(),
    { keyEncoding: cbor_leveldb,
      valueEncoding: cbor_leveldb })

```

