// abstract-leveldown 5.0 dependent
const testCommon = require('abstract-leveldown/testCommon.js')
const memdown = require('memdown')
const encoding_down = require('encoding-down')

const cbor_leveldb = require('cbor-codec/leveldb')

suite({
  test: require('tape').test,
  factory() {
    return encoding_down( memdown(), {
      keyEncoding: cbor_leveldb,
      valueEncoding: cbor_leveldb, })
}})

function suite({test, factory}) {

  require('abstract-leveldown/abstract/open-test').args(factory, test, testCommon)

  require('abstract-leveldown/abstract/del-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/del-test').args(test)

  require('abstract-leveldown/abstract/get-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/get-test').args(test)

  require('abstract-leveldown/abstract/put-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/put-test').args(test)

  require('abstract-leveldown/abstract/put-get-del-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/put-get-del-test').errorKeys(test)
  // require('abstract-leveldown/abstract/put-get-del-test').nonErrorKeys(test, testCommon)
  require('abstract-leveldown/abstract/put-get-del-test').errorValues()
  require('abstract-leveldown/abstract/put-get-del-test').tearDown(test, testCommon)

  require('abstract-leveldown/abstract/batch-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/batch-test').args(test)

  require('abstract-leveldown/abstract/chained-batch-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/chained-batch-test').args(test)

  require('abstract-leveldown/abstract/close-test').close(factory, test, testCommon)

  require('abstract-leveldown/abstract/iterator-test').setUp(factory, test, testCommon)
  require('abstract-leveldown/abstract/iterator-test').args(test)
  require('abstract-leveldown/abstract/iterator-test').sequence(test)

}
