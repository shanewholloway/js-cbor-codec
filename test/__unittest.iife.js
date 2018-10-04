(function () {
  'use strict';

  var test_vectors = [
    {
      enabled: true
    , cbor: "AA=="
    , hex: "00"
    , roundtrip: true
    , decoded: 0}

  , {
      cbor: "AQ=="
    , hex: "01"
    , roundtrip: true
    , decoded: 1}

  , {
      cbor: "Cg=="
    , hex: "0a"
    , roundtrip: true
    , decoded: 10}

  , {
      cbor: "Fw=="
    , hex: "17"
    , roundtrip: true
    , decoded: 23}

  , {
      cbor: "GBg="
    , hex: "1818"
    , roundtrip: true
    , decoded: 24}

  , {
      cbor: "GBk="
    , hex: "1819"
    , roundtrip: true
    , decoded: 25}

  , {
      cbor: "GGQ="
    , hex: "1864"
    , roundtrip: true
    , decoded: 100}

  , {
      cbor: "GQPo"
    , hex: "1903e8"
    , roundtrip: true
    , decoded: 1000}

  , {
      cbor: "GgAPQkA="
    , hex: "1a000f4240"
    , roundtrip: true
    , decoded: 1000000}

  , {
      cbor: "GwAAAOjUpRAA"
    , hex: "1b000000e8d4a51000"
    , roundtrip: true
    , decoded: 1000000000000}

  , {
      cbor: "G///////////"
    , hex: "1bffffffffffffffff"
    , roundtrip: true
    , decoded: 18446744073709551615}

  , {
      cbor: "wkkBAAAAAAAAAAA="
    , hex: "c249010000000000000000"
    , roundtrip: true
    , decoded: 18446744073709551616}

  , {
      cbor: "O///////////"
    , hex: "3bffffffffffffffff"
    , roundtrip: true
    , decoded: -18446744073709551616}

  , {
      cbor: "w0kBAAAAAAAAAAA="
    , hex: "c349010000000000000000"
    , roundtrip: true
    , decoded: -18446744073709551617}

  , {
      cbor: "IA=="
    , hex: "20"
    , roundtrip: true
    , decoded: -1}

  , {
      cbor: "KQ=="
    , hex: "29"
    , roundtrip: true
    , decoded: -10}

  , {
      cbor: "OGM="
    , hex: "3863"
    , roundtrip: true
    , decoded: -100}

  , {
      cbor: "OQPn"
    , hex: "3903e7"
    , roundtrip: true
    , decoded: -1000}

  , {
      cbor: "+QAA"
    , hex: "f90000"
    , roundtrip: true
    , decoded: 0.0}

  , {
      cbor: "+YAA"
    , hex: "f98000"
    , roundtrip: true
    , decoded: -0.0}

  , {
      cbor: "+TwA"
    , hex: "f93c00"
    , roundtrip: true
    , decoded: 1.0}

  , {
      cbor: "+z/xmZmZmZma"
    , hex: "fb3ff199999999999a"
    , roundtrip: true
    , decoded: 1.1}

  , {
      cbor: "+T4A"
    , hex: "f93e00"
    , roundtrip: true
    , decoded: 1.5}

  , {
      cbor: "+Xv/"
    , hex: "f97bff"
    , roundtrip: true
    , decoded: 65504.0}

  , {
      cbor: "+kfDUAA="
    , hex: "fa47c35000"
    , roundtrip: true
    , decoded: 100000.0}

  , {
      cbor: "+n9///8="
    , hex: "fa7f7fffff"
    , roundtrip: true
    , decoded: 3.4028234663852886e+38}

  , {
      cbor: "+3435DyIAHWc"
    , hex: "fb7e37e43c8800759c"
    , roundtrip: true
    , decoded: 1.0e+300}

  , {
      cbor: "+QAB"
    , hex: "f90001"
    , roundtrip: true
    , decoded: 5.960464477539063e-08}

  , {
      cbor: "+QQA"
    , hex: "f90400"
    , roundtrip: true
    , decoded: 6.103515625e-05}

  , {
      cbor: "+cQA"
    , hex: "f9c400"
    , roundtrip: true
    , decoded: -4.0}

  , {
      cbor: "+8AQZmZmZmZm"
    , hex: "fbc010666666666666"
    , roundtrip: true
    , decoded: -4.1}

  , {
      cbor: "+XwA"
    , hex: "f97c00"
    , roundtrip: true
    , diagnostic: "Infinity"}

  , {
      cbor: "+X4A"
    , hex: "f97e00"
    , roundtrip: true
    , diagnostic: "NaN"}

  , {
      cbor: "+fwA"
    , hex: "f9fc00"
    , roundtrip: true
    , diagnostic: "-Infinity"}

  , {
      cbor: "+n+AAAA="
    , hex: "fa7f800000"
    , roundtrip: false
    , diagnostic: "Infinity"}

  , {
      cbor: "+n/AAAA="
    , hex: "fa7fc00000"
    , roundtrip: false
    , diagnostic: "NaN"}

  , {
      cbor: "+v+AAAA="
    , hex: "faff800000"
    , roundtrip: false
    , diagnostic: "-Infinity"}

  , {
      cbor: "+3/wAAAAAAAA"
    , hex: "fb7ff0000000000000"
    , roundtrip: false
    , diagnostic: "Infinity"}

  , {
      cbor: "+3/4AAAAAAAA"
    , hex: "fb7ff8000000000000"
    , roundtrip: false
    , diagnostic: "NaN"}

  , {
      cbor: "+//wAAAAAAAA"
    , hex: "fbfff0000000000000"
    , roundtrip: false
    , diagnostic: "-Infinity"}

  , {
      cbor: "9A=="
    , hex: "f4"
    , roundtrip: true
    , decoded: false}

  , {
      cbor: "9Q=="
    , hex: "f5"
    , roundtrip: true
    , decoded: true}

  , {
      cbor: "9g=="
    , hex: "f6"
    , roundtrip: true
    , decoded: null}

  , {
      cbor: "9w=="
    , hex: "f7"
    , roundtrip: true
    , diagnostic: "undefined"}

  , {
      cbor: "8A=="
    , hex: "f0"
    , roundtrip: true
    , diagnostic: "simple(16)"}

  , {
      cbor: "+Bg="
    , hex: "f818"
    , roundtrip: true
    , diagnostic: "simple(24)"}

  , {
      cbor: "+P8="
    , hex: "f8ff"
    , roundtrip: true
    , diagnostic: "simple(255)"}

  , {
      cbor: "wHQyMDEzLTAzLTIxVDIwOjA0OjAwWg=="
    , hex: "c074323031332d30332d32315432303a30343a30305a"
    , roundtrip: true
    , diagnostic: "0(\"2013-03-21T20:04:00Z\")"}

  , {
      cbor: "wRpRS2ew"
    , hex: "c11a514b67b0"
    , roundtrip: true
    , diagnostic: "1(1363896240)"}

  , {
      cbor: "wftB1FLZ7CAAAA=="
    , hex: "c1fb41d452d9ec200000"
    , roundtrip: true
    , diagnostic: "1(1363896240.5)"}

  , {
      cbor: "10QBAgME"
    , hex: "d74401020304"
    , roundtrip: true
    , diagnostic: "23(h'01020304')"}

  , {
      cbor: "2BhFZElFVEY="
    , hex: "d818456449455446"
    , roundtrip: true
    , diagnostic: "24(h'6449455446')"}

  , {
      cbor: "2CB2aHR0cDovL3d3dy5leGFtcGxlLmNvbQ=="
    , hex: "d82076687474703a2f2f7777772e6578616d706c652e636f6d"
    , roundtrip: true
    , diagnostic: "32(\"http://www.example.com\")"}

  , {
      cbor: "QA=="
    , hex: "40"
    , roundtrip: true
    , diagnostic: "h''"}

  , {
      cbor: "RAECAwQ="
    , hex: "4401020304"
    , roundtrip: true
    , diagnostic: "h'01020304'"}

  , {
      cbor: "YA=="
    , hex: "60"
    , roundtrip: true
    , decoded: ""}

  , {
      cbor: "YWE="
    , hex: "6161"
    , roundtrip: true
    , decoded: "a"}

  , {
      cbor: "ZElFVEY="
    , hex: "6449455446"
    , roundtrip: true
    , decoded: "IETF"}

  , {
      cbor: "YiJc"
    , hex: "62225c"
    , roundtrip: true
    , decoded: "\"\\"}

  , {
      cbor: "YsO8"
    , hex: "62c3bc"
    , roundtrip: true
    , decoded: "ü"}

  , {
      cbor: "Y+awtA=="
    , hex: "63e6b0b4"
    , roundtrip: true
    , decoded: "水"}

  , {
      cbor: "ZPCQhZE="
    , hex: "64f0908591"
    , roundtrip: true
    , decoded: "𐅑"}

  , {
      cbor: "gA=="
    , hex: "80"
    , roundtrip: true
    , decoded: [

      ]}

  , {
      cbor: "gwECAw=="
    , hex: "83010203"
    , roundtrip: true
    , decoded:[1, 2, 3] }

  , {
      cbor: "gwGCAgOCBAU="
    , hex: "8301820203820405"
    , roundtrip: true
    , decoded:[
        1
      , [2, 3]
      , [4, 5] ] }

  , {
      cbor: "mBkBAgMEBQYHCAkKCwwNDg8QERITFBUWFxgYGBk="
    , hex: "98190102030405060708090a0b0c0d0e0f101112131415161718181819"
    , roundtrip: true
    , decoded:[
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25] }

  , {
      cbor: "oA=="
    , hex: "a0"
    , roundtrip: true
    , decoded:{} }


  , {
      cbor: "ogECAwQ="
    , hex: "a201020304"
    , roundtrip: true
    , diagnostic: "{1: 2, 3: 4}"}

  , {
      cbor: "omFhAWFiggID"
    , hex: "a26161016162820203"
    , roundtrip: true
    , decoded:{
        "a": 1
      , "b":[
          2
        , 3] } }

  , {
      cbor: "gmFhoWFiYWM="
    , hex: "826161a161626163"
    , roundtrip: true
    , decoded:[
        "a"
      , {"b": "c"} ] }

  , {
      cbor: "pWFhYUFhYmFCYWNhQ2FkYURhZWFF"
    , hex: "a56161614161626142616361436164614461656145"
    , roundtrip: true
    , decoded:{
        "a": "A"
      , "b": "B"
      , "c": "C"
      , "d": "D"
      , "e": "E"} }


  , {
      cbor: "X0IBAkMDBAX/"
    , hex: "5f42010243030405ff"
    , roundtrip: false
    , diagnostic: "(_ h'0102', h'030405')"}

  , {
      cbor: "f2VzdHJlYWRtaW5n/w=="
    , hex: "7f657374726561646d696e67ff"
    , roundtrip: false
    , decoded: "streaming"}

  , {
      cbor: "n/8="
    , hex: "9fff"
    , roundtrip: false
    , decoded: []}

  , {
      cbor: "nwGCAgOfBAX//w=="
    , hex: "9f018202039f0405ffff"
    , roundtrip: false
    , decoded:[
        1
      , [2, 3]
      , [4, 5] ] }

  , {
      cbor: "nwGCAgOCBAX/"
    , hex: "9f01820203820405ff"
    , roundtrip: false
    , decoded:[
        1
      , [2, 3]
      , [4, 5] ] }

  , {
      cbor: "gwGCAgOfBAX/"
    , hex: "83018202039f0405ff"
    , roundtrip: false
    , decoded:[
        1
      , [2, 3]
      , [4, 5] ] }

  , {
      cbor: "gwGfAgP/ggQF"
    , hex: "83019f0203ff820405"
    , roundtrip: false
    , decoded:[
        1
      , [2, 3]
      , [4, 5] ] }

  , {
      cbor: "nwECAwQFBgcICQoLDA0ODxAREhMUFRYXGBgYGf8="
    , hex: "9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff"
    , roundtrip: false
    , decoded:[
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
      , 17, 18, 19, 20, 21, 22, 23, 24, 25] }

  , {
      cbor: "v2FhAWFinwID//8="
    , hex: "bf61610161629f0203ffff"
    , roundtrip: false
    , decoded:{
        "a": 1
      , "b":[2, 3] } }


  , {
      cbor: "gmFhv2FiYWP/"
    , hex: "826161bf61626163ff"
    , roundtrip: false
    , decoded:[
        "a"
      , {"b": "c"} ] }

  , {
      cbor: "v2NGdW71Y0FtdCH/"
    , hex: "bf6346756ef563416d7421ff"
    , roundtrip: false
    , decoded:{
        "Fun": true
      , "Amt": -2} } ];

  const cbor_u8_decode = cbor_bind_u8_decoder();

  function bind_cbor_u8_decode(jmp) {
    cbor_u8_decode.jmp = jmp;
    return cbor_u8_decode

    function cbor_u8_decode(u8) {
      const disp = jmp[u8[0]];
      console.log([u8[0], disp]);
      return disp(u8)} }

  function cbor_bind_u8_decoder(options) {
    if (null == options) {options = {};}

    const simple_value = bind_simple_value(options.simple);

    const tiny_pos_int = _cbor_tiny(as_pos_int);
    const tiny_neg_int = _cbor_tiny(as_neg_int);
    const tiny_bytes = _cbor_tiny(as_bytes);
    const tiny_utf8 = _cbor_tiny(as_utf8);
    const tiny_array = _cbor_tiny(as_array);
    const tiny_map = _cbor_tiny(as_map);
    const tiny_tag = _cbor_tiny(as_tag);
    const tiny_simple = _cbor_tiny(simple_value);

    const jmp = [];

    for (let i=0; i<= 23; i++) {
      jmp[0x00 | i] = tiny_pos_int;
      jmp[0x20 | i] = tiny_neg_int;
      jmp[0x40 | i] = tiny_bytes;
      jmp[0x60 | i] = tiny_utf8;
      jmp[0x80 | i] = tiny_array;
      jmp[0xa0 | i] = tiny_map;
      jmp[0xc0 | i] = tiny_tag;
      jmp[0xe0 | i] = tiny_simple;}

    const cbor_widths =[_cbor_w1, _cbor_w2, _cbor_w4, _cbor_w8];
    for (let w=0; w< 4; w++) {
      const i = 24+w, width = cbor_widths[w];
      jmp[0x00 | i] = width(as_pos_int);
      jmp[0x20 | i] = width(as_neg_int);
      jmp[0x40 | i] = width(as_bytes);
      jmp[0x60 | i] = width(as_utf8);
      jmp[0x80 | i] = width(as_array);
      jmp[0xa0 | i] = width(as_map);
      jmp[0xc0 | i] = width(as_tag);
      jmp[0xe0 | i] = width(simple_value); }

    jmp[0x5f] = _cbor_stream(as_bytes_stream);
    jmp[0x7f] = _cbor_stream(as_utf8_stream);
    jmp[0x9f] = _cbor_stream(as_array_stream);
    jmp[0xbf] = _cbor_stream(as_map_stream);

    // semantic tag

    // primitives
    jmp[0xf4] = bind_cbor_value(false);
    jmp[0xf5] = bind_cbor_value(true);
    jmp[0xf6] = bind_cbor_value(null);
    jmp[0xf7] = bind_cbor_value(void 0);
    jmp[0xf8] = _cbor_w1(simple_value);
    jmp[0xf9] = half_float;
    jmp[0xfa] = single_float;
    jmp[0xfb] = double_float;
    //jmp[0xfc] = undefined
    //jmp[0xfd] = undefined
    //jmp[0xfe] = undefined
    jmp[0xff] = _cbor_break;

    return bind_cbor_u8_decode(jmp)}

  function _cbor_tiny(as_type) {
    return function () {throw new Error('TODO: _cbor_tiny')} }
  function _cbor_w1() {
    return function () {throw new Error('TODO: _cbor_w1')} }
  function _cbor_w2() {
    return function () {throw new Error('TODO: _cbor_w2')} }
  function _cbor_w4() {
    return function () {throw new Error('TODO: _cbor_w4')} }
  function _cbor_w8() {
    return function () {throw new Error('TODO: _cbor_w8')} }
  function _cbor_stream() {
    return function () {throw new Error('TODO: _cbor_stream')} }

  function _cbor_break() {
    console.dir({break: true});
    throw new Error('TODO: break') }

  function bind_cbor_value(value) {
    return function() {
      console.dir({value});
      throw new Error('TODO: value') } }

  function half_float() {
    throw new Error('TODO: half_float') }
  function single_float() {
    throw new Error('TODO: single_float') }
  function double_float() {
    throw new Error('TODO: double_float') }

  function bind_simple_value(simple_lut) {
    return function() {
      throw new Error('TODO: simple') } }

  function as_pos_int() {throw new Error('TODO: as_pos_int')}
  function as_neg_int() {throw new Error('TODO: as_neg_int')}
  function as_bytes() {throw new Error('TODO: as_bytes')}
  function as_utf8() {throw new Error('TODO: as_utf8')}
  function as_array() {throw new Error('TODO: as_array')}
  function as_map() {throw new Error('TODO: as_map')}
  function as_tag() {throw new Error('TODO: as_tag')}

  function as_bytes_stream() {throw new Error('TODO: as_bytes_stream')}
  function as_utf8_stream() {throw new Error('TODO: as_utf8_stream')}
  function as_array_stream() {throw new Error('TODO: as_array_stream')}
  function as_map_stream() {throw new Error('TODO: as_map_stream')}
  //# sourceMappingURL=cbor_decode.js.map

  const {assert} = require('chai');

  const _charCodeAt = ''.charCodeAt;
  function base64_to_u8(str_b64) {
    const sz = atob(str_b64.replace(/-/g, '+').replace(/_/g, '/'));
    const len = sz.length;
    const res = new Uint8Array(len);
    for (let i=0; i<len; i++) {
      res[i] = _charCodeAt.call(sz, i);}
    return res}


  describe('CBOR Decode Test Vectors',(()=> {
    for (const test of test_vectors) {

      const it_fn = test.skip ? it.skip : test.only ? it.only : test.enabled ? it : it.skip;
      it_fn(`cbor_u8_decode "${test.hex}" to ${test.diagnostic || JSON.stringify(test.decoded)}`,(()=> {
        const u8 = base64_to_u8(test.cbor);

        const ans = cbor_u8_decode(u8);
        if (test.diagnostic) {
          assert.ok(false, 'TODO: diagnostic'); }
        else {
          assert.deepEqual(ans, test.decoded); } } ) ); } } ) );

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX191bml0dGVzdC5paWZlLmpzIiwic291cmNlcyI6WyJ0ZXN0X3ZlY3RvcnNfX2FwcGVuZGl4X2EuanN5IiwiLi4vZXNtL3dlYi9jYm9yX2RlY29kZS5qcyIsInVuaXR0ZXN0LmpzeSJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBAW11cbiAgQHt9XG4gICAgZW5hYmxlZDogdHJ1ZVxuICAgIGNib3I6IFwiQUE9PVwiXG4gICAgaGV4OiBcIjAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJBUT09XCJcbiAgICBoZXg6IFwiMDFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDFcblxuICBAe31cbiAgICBjYm9yOiBcIkNnPT1cIlxuICAgIGhleDogXCIwYVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTBcblxuICBAe31cbiAgICBjYm9yOiBcIkZ3PT1cIlxuICAgIGhleDogXCIxN1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMjNcblxuICBAe31cbiAgICBjYm9yOiBcIkdCZz1cIlxuICAgIGhleDogXCIxODE4XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAyNFxuXG4gIEB7fVxuICAgIGNib3I6IFwiR0JrPVwiXG4gICAgaGV4OiBcIjE4MTlcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDI1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJHR1E9XCJcbiAgICBoZXg6IFwiMTg2NFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHUVBvXCJcbiAgICBoZXg6IFwiMTkwM2U4XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxMDAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHZ0FQUWtBPVwiXG4gICAgaGV4OiBcIjFhMDAwZjQyNDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMDAwMDBcblxuICBAe31cbiAgICBjYm9yOiBcIkd3QUFBT2pVcFJBQVwiXG4gICAgaGV4OiBcIjFiMDAwMDAwZThkNGE1MTAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwMDAwMDAwMDAwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiRy8vLy8vLy8vLy8vXCJcbiAgICBoZXg6IFwiMWJmZmZmZmZmZmZmZmZmZmZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxODQ0Njc0NDA3MzcwOTU1MTYxNVxuXG4gIEB7fVxuICAgIGNib3I6IFwid2trQkFBQUFBQUFBQUFBPVwiXG4gICAgaGV4OiBcImMyNDkwMTAwMDAwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDE4NDQ2NzQ0MDczNzA5NTUxNjE2XG5cbiAgQHt9XG4gICAgY2JvcjogXCJPLy8vLy8vLy8vLy9cIlxuICAgIGhleDogXCIzYmZmZmZmZmZmZmZmZmZmZmZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0xODQ0Njc0NDA3MzcwOTU1MTYxNlxuXG4gIEB7fVxuICAgIGNib3I6IFwidzBrQkFBQUFBQUFBQUFBPVwiXG4gICAgaGV4OiBcImMzNDkwMTAwMDAwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0xODQ0Njc0NDA3MzcwOTU1MTYxN1xuXG4gIEB7fVxuICAgIGNib3I6IFwiSUE9PVwiXG4gICAgaGV4OiBcIjIwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMVxuXG4gIEB7fVxuICAgIGNib3I6IFwiS1E9PVwiXG4gICAgaGV4OiBcIjI5XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTBcblxuICBAe31cbiAgICBjYm9yOiBcIk9HTT1cIlxuICAgIGhleDogXCIzODYzXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJPUVBuXCJcbiAgICBoZXg6IFwiMzkwM2U3XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTAwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1FBQVwiXG4gICAgaGV4OiBcImY5MDAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrWUFBXCJcbiAgICBoZXg6IFwiZjk4MDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrVHdBXCJcbiAgICBoZXg6IFwiZjkzYzAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjBcblxuICBAe31cbiAgICBjYm9yOiBcIit6L3htWm1abVptYVwiXG4gICAgaGV4OiBcImZiM2ZmMTk5OTk5OTk5OTk5YVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMS4xXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrVDRBXCJcbiAgICBoZXg6IFwiZjkzZTAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjVcblxuICBAe31cbiAgICBjYm9yOiBcIitYdi9cIlxuICAgIGhleDogXCJmOTdiZmZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDY1NTA0LjBcblxuICBAe31cbiAgICBjYm9yOiBcIitrZkRVQUE9XCJcbiAgICBoZXg6IFwiZmE0N2MzNTAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwMDAwLjBcblxuICBAe31cbiAgICBjYm9yOiBcIituOS8vLzg9XCJcbiAgICBoZXg6IFwiZmE3ZjdmZmZmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMy40MDI4MjM0NjYzODUyODg2ZSszOFxuXG4gIEB7fVxuICAgIGNib3I6IFwiKzM0MzVEeUlBSFdjXCJcbiAgICBoZXg6IFwiZmI3ZTM3ZTQzYzg4MDA3NTljXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjBlKzMwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1FBQlwiXG4gICAgaGV4OiBcImY5MDAwMVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogNS45NjA0NjQ0Nzc1MzkwNjNlLTA4XG5cbiAgQHt9XG4gICAgY2JvcjogXCIrUVFBXCJcbiAgICBoZXg6IFwiZjkwNDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiA2LjEwMzUxNTYyNWUtMDVcblxuICBAe31cbiAgICBjYm9yOiBcIitjUUFcIlxuICAgIGhleDogXCJmOWM0MDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC00LjBcblxuICBAe31cbiAgICBjYm9yOiBcIis4QVFabVptWm1abVwiXG4gICAgaGV4OiBcImZiYzAxMDY2NjY2NjY2NjY2NlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTQuMVxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1h3QVwiXG4gICAgaGV4OiBcImY5N2MwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJJbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrWDRBXCJcbiAgICBoZXg6IFwiZjk3ZTAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIk5hTlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrZndBXCJcbiAgICBoZXg6IFwiZjlmYzAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIi1JbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrbitBQUFBPVwiXG4gICAgaGV4OiBcImZhN2Y4MDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIkluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIituL0FBQUE9XCJcbiAgICBoZXg6IFwiZmE3ZmMwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiTmFOXCJcblxuICBAe31cbiAgICBjYm9yOiBcIit2K0FBQUE9XCJcbiAgICBoZXg6IFwiZmFmZjgwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiLUluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIiszL3dBQUFBQUFBQVwiXG4gICAgaGV4OiBcImZiN2ZmMDAwMDAwMDAwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiKzMvNEFBQUFBQUFBXCJcbiAgICBoZXg6IFwiZmI3ZmY4MDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCJOYU5cIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiKy8vd0FBQUFBQUFBXCJcbiAgICBoZXg6IFwiZmJmZmYwMDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCItSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiOUE9PVwiXG4gICAgaGV4OiBcImY0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBmYWxzZVxuXG4gIEB7fVxuICAgIGNib3I6IFwiOVE9PVwiXG4gICAgaGV4OiBcImY1XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiB0cnVlXG5cbiAgQHt9XG4gICAgY2JvcjogXCI5Zz09XCJcbiAgICBoZXg6IFwiZjZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IG51bGxcblxuICBAe31cbiAgICBjYm9yOiBcIjl3PT1cIlxuICAgIGhleDogXCJmN1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJ1bmRlZmluZWRcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiOEE9PVwiXG4gICAgaGV4OiBcImYwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcInNpbXBsZSgxNilcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK0JnPVwiXG4gICAgaGV4OiBcImY4MThcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwic2ltcGxlKDI0KVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrUDg9XCJcbiAgICBoZXg6IFwiZjhmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJzaW1wbGUoMjU1KVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ3SFF5TURFekxUQXpMVEl4VkRJd09qQTBPakF3V2c9PVwiXG4gICAgaGV4OiBcImMwNzQzMjMwMzEzMzJkMzAzMzJkMzIzMTU0MzIzMDNhMzAzNDNhMzAzMDVhXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjAoXFxcIjIwMTMtMDMtMjFUMjA6MDQ6MDBaXFxcIilcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwid1JwUlMyZXdcIlxuICAgIGhleDogXCJjMTFhNTE0YjY3YjBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMSgxMzYzODk2MjQwKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ3ZnRCMUZMWjdDQUFBQT09XCJcbiAgICBoZXg6IFwiYzFmYjQxZDQ1MmQ5ZWMyMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMSgxMzYzODk2MjQwLjUpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIjEwUUJBZ01FXCJcbiAgICBoZXg6IFwiZDc0NDAxMDIwMzA0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjIzKGgnMDEwMjAzMDQnKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIyQmhGWkVsRlZFWT1cIlxuICAgIGhleDogXCJkODE4NDU2NDQ5NDU1NDQ2XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjI0KGgnNjQ0OTQ1NTQ0NicpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIjJDQjJhSFIwY0RvdkwzZDNkeTVsZUdGdGNHeGxMbU52YlE9PVwiXG4gICAgaGV4OiBcImQ4MjA3NjY4NzQ3NDcwM2EyZjJmNzc3Nzc3MmU2NTc4NjE2ZDcwNmM2NTJlNjM2ZjZkXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjMyKFxcXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tXFxcIilcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiUUE9PVwiXG4gICAgaGV4OiBcIjQwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcImgnJ1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJSQUVDQXdRPVwiXG4gICAgaGV4OiBcIjQ0MDEwMjAzMDRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiaCcwMTAyMDMwNCdcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWUE9PVwiXG4gICAgaGV4OiBcIjYwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZV0U9XCJcbiAgICBoZXg6IFwiNjE2MVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCJhXCJcblxuICBAe31cbiAgICBjYm9yOiBcIlpFbEZWRVk9XCJcbiAgICBoZXg6IFwiNjQ0OTQ1NTQ0NlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCJJRVRGXCJcblxuICBAe31cbiAgICBjYm9yOiBcIllpSmNcIlxuICAgIGhleDogXCI2MjIyNWNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwiXFxcIlxcXFxcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWXNPOFwiXG4gICAgaGV4OiBcIjYyYzNiY1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCLDvFwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZK2F3dEE9PVwiXG4gICAgaGV4OiBcIjYzZTZiMGI0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIuawtFwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJaUENRaFpFPVwiXG4gICAgaGV4OiBcIjY0ZjA5MDg1OTFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwi8JCFkVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnQT09XCJcbiAgICBoZXg6IFwiODBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFtcblxuICAgIF1cblxuICBAe31cbiAgICBjYm9yOiBcImd3RUNBdz09XCJcbiAgICBoZXg6IFwiODMwMTAyMDNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEBbXSAxLCAyLCAzXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0dDQWdPQ0JBVT1cIlxuICAgIGhleDogXCI4MzAxODIwMjAzODIwNDA1XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwibUJrQkFnTUVCUVlIQ0FrS0N3d05EZzhRRVJJVEZCVVdGeGdZR0JrPVwiXG4gICAgaGV4OiBcIjk4MTkwMTAyMDMwNDA1MDYwNzA4MDkwYTBiMGMwZDBlMGYxMDExMTIxMzE0MTUxNjE3MTgxODE4MTlcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsXG4gICAgICAxNywgMTgsIDE5LCAyMCwgMjEsIDIyLCAyMywgMjQsIDI1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJvQT09XCJcbiAgICBoZXg6IFwiYTBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEB7fVxuXG5cbiAgQHt9XG4gICAgY2JvcjogXCJvZ0VDQXdRPVwiXG4gICAgaGV4OiBcImEyMDEwMjAzMDRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiezE6IDIsIDM6IDR9XCJcblxuICBAe31cbiAgICBjYm9yOiBcIm9tRmhBV0ZpZ2dJRFwiXG4gICAgaGV4OiBcImEyNjE2MTAxNjE2MjgyMDIwM1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogQHt9XG4gICAgICBcImFcIjogMVxuICAgICAgXCJiXCI6IEBbXVxuICAgICAgICAyXG4gICAgICAgIDNcblxuICBAe31cbiAgICBjYm9yOiBcImdtRmhvV0ZpWVdNPVwiXG4gICAgaGV4OiBcIjgyNjE2MWExNjE2MjYxNjNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgXCJhXCJcbiAgICAgIEB7fSBcImJcIjogXCJjXCJcblxuICBAe31cbiAgICBjYm9yOiBcInBXRmhZVUZoWW1GQ1lXTmhRMkZrWVVSaFpXRkZcIlxuICAgIGhleDogXCJhNTYxNjE2MTQxNjE2MjYxNDI2MTYzNjE0MzYxNjQ2MTQ0NjE2NTYxNDVcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEB7fVxuICAgICAgXCJhXCI6IFwiQVwiXG4gICAgICBcImJcIjogXCJCXCJcbiAgICAgIFwiY1wiOiBcIkNcIlxuICAgICAgXCJkXCI6IFwiRFwiXG4gICAgICBcImVcIjogXCJFXCJcblxuXG4gIEB7fVxuICAgIGNib3I6IFwiWDBJQkFrTURCQVgvXCJcbiAgICBoZXg6IFwiNWY0MjAxMDI0MzAzMDQwNWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCIoXyBoJzAxMDInLCBoJzAzMDQwNScpXCJcblxuICBAe31cbiAgICBjYm9yOiBcImYyVnpkSEpsWVdSdGFXNW4vdz09XCJcbiAgICBoZXg6IFwiN2Y2NTczNzQ3MjY1NjE2NDZkNjk2ZTY3ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBcInN0cmVhbWluZ1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJuLzg9XCJcbiAgICBoZXg6IFwiOWZmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IFtdXG5cbiAgQHt9XG4gICAgY2JvcjogXCJud0dDQWdPZkJBWC8vdz09XCJcbiAgICBoZXg6IFwiOWYwMTgyMDIwMzlmMDQwNWZmZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwibndHQ0FnT0NCQVgvXCJcbiAgICBoZXg6IFwiOWYwMTgyMDIwMzgyMDQwNWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcImd3R0NBZ09mQkFYL1wiXG4gICAgaGV4OiBcIjgzMDE4MjAyMDM5ZjA0MDVmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMVxuICAgICAgQFtdIDIsIDNcbiAgICAgIEBbXSA0LCA1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0dmQWdQL2dnUUZcIlxuICAgIGhleDogXCI4MzAxOWYwMjAzZmY4MjA0MDVcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwibndFQ0F3UUZCZ2NJQ1FvTERBME9EeEFSRWhNVUZSWVhHQmdZR2Y4PVwiXG4gICAgaGV4OiBcIjlmMDEwMjAzMDQwNTA2MDcwODA5MGEwYjBjMGQwZTBmMTAxMTEyMTMxNDE1MTYxNzE4MTgxODE5ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2XG4gICAgICAxNywgMTgsIDE5LCAyMCwgMjEsIDIyLCAyMywgMjQsIDI1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJ2MkZoQVdGaW53SUQvLzg9XCJcbiAgICBoZXg6IFwiYmY2MTYxMDE2MTYyOWYwMjAzZmZmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEB7fVxuICAgICAgXCJhXCI6IDFcbiAgICAgIFwiYlwiOiBAW10gMiwgM1xuXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnbUZodjJGaVlXUC9cIlxuICAgIGhleDogXCI4MjYxNjFiZjYxNjI2MTYzZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIFwiYVwiXG4gICAgICBAe30gXCJiXCI6IFwiY1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ2Mk5HZFc3MVkwRnRkQ0gvXCJcbiAgICBoZXg6IFwiYmY2MzQ2NzU2ZWY1NjM0MTZkNzQyMWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQHt9XG4gICAgICBcIkZ1blwiOiB0cnVlXG4gICAgICBcIkFtdFwiOiAtMlxuIiwiY29uc3QgY2Jvcl91OF9kZWNvZGUgPSBjYm9yX2JpbmRfdThfZGVjb2RlcigpO1xuXG5mdW5jdGlvbiBiaW5kX2Nib3JfdThfZGVjb2RlKGptcCkge1xuICBjYm9yX3U4X2RlY29kZS5qbXAgPSBqbXA7XG4gIHJldHVybiBjYm9yX3U4X2RlY29kZVxuXG4gIGZ1bmN0aW9uIGNib3JfdThfZGVjb2RlKHU4KSB7XG4gICAgY29uc3QgZGlzcCA9IGptcFt1OFswXV07XG4gICAgY29uc29sZS5sb2coW3U4WzBdLCBkaXNwXSk7XG4gICAgcmV0dXJuIGRpc3AodTgpfSB9XG5cbmZ1bmN0aW9uIGNib3JfYmluZF91OF9kZWNvZGVyKG9wdGlvbnMpIHtcbiAgaWYgKG51bGwgPT0gb3B0aW9ucykge29wdGlvbnMgPSB7fTt9XG5cbiAgY29uc3Qgc2ltcGxlX3ZhbHVlID0gYmluZF9zaW1wbGVfdmFsdWUob3B0aW9ucy5zaW1wbGUpO1xuXG4gIGNvbnN0IHRpbnlfcG9zX2ludCA9IF9jYm9yX3RpbnkoYXNfcG9zX2ludCk7XG4gIGNvbnN0IHRpbnlfbmVnX2ludCA9IF9jYm9yX3RpbnkoYXNfbmVnX2ludCk7XG4gIGNvbnN0IHRpbnlfYnl0ZXMgPSBfY2Jvcl90aW55KGFzX2J5dGVzKTtcbiAgY29uc3QgdGlueV91dGY4ID0gX2Nib3JfdGlueShhc191dGY4KTtcbiAgY29uc3QgdGlueV9hcnJheSA9IF9jYm9yX3RpbnkoYXNfYXJyYXkpO1xuICBjb25zdCB0aW55X21hcCA9IF9jYm9yX3RpbnkoYXNfbWFwKTtcbiAgY29uc3QgdGlueV90YWcgPSBfY2Jvcl90aW55KGFzX3RhZyk7XG4gIGNvbnN0IHRpbnlfc2ltcGxlID0gX2Nib3JfdGlueShzaW1wbGVfdmFsdWUpO1xuXG4gIGNvbnN0IGptcCA9IFtdO1xuXG4gIGZvciAobGV0IGk9MDsgaTw9IDIzOyBpKyspIHtcbiAgICBqbXBbMHgwMCB8IGldID0gdGlueV9wb3NfaW50O1xuICAgIGptcFsweDIwIHwgaV0gPSB0aW55X25lZ19pbnQ7XG4gICAgam1wWzB4NDAgfCBpXSA9IHRpbnlfYnl0ZXM7XG4gICAgam1wWzB4NjAgfCBpXSA9IHRpbnlfdXRmODtcbiAgICBqbXBbMHg4MCB8IGldID0gdGlueV9hcnJheTtcbiAgICBqbXBbMHhhMCB8IGldID0gdGlueV9tYXA7XG4gICAgam1wWzB4YzAgfCBpXSA9IHRpbnlfdGFnO1xuICAgIGptcFsweGUwIHwgaV0gPSB0aW55X3NpbXBsZTt9XG5cbiAgY29uc3QgY2Jvcl93aWR0aHMgPVtfY2Jvcl93MSwgX2Nib3JfdzIsIF9jYm9yX3c0LCBfY2Jvcl93OF07XG4gIGZvciAobGV0IHc9MDsgdzwgNDsgdysrKSB7XG4gICAgY29uc3QgaSA9IDI0K3csIHdpZHRoID0gY2Jvcl93aWR0aHNbd107XG4gICAgam1wWzB4MDAgfCBpXSA9IHdpZHRoKGFzX3Bvc19pbnQpO1xuICAgIGptcFsweDIwIHwgaV0gPSB3aWR0aChhc19uZWdfaW50KTtcbiAgICBqbXBbMHg0MCB8IGldID0gd2lkdGgoYXNfYnl0ZXMpO1xuICAgIGptcFsweDYwIHwgaV0gPSB3aWR0aChhc191dGY4KTtcbiAgICBqbXBbMHg4MCB8IGldID0gd2lkdGgoYXNfYXJyYXkpO1xuICAgIGptcFsweGEwIHwgaV0gPSB3aWR0aChhc19tYXApO1xuICAgIGptcFsweGMwIHwgaV0gPSB3aWR0aChhc190YWcpO1xuICAgIGptcFsweGUwIHwgaV0gPSB3aWR0aChzaW1wbGVfdmFsdWUpOyB9XG5cbiAgam1wWzB4NWZdID0gX2Nib3Jfc3RyZWFtKGFzX2J5dGVzX3N0cmVhbSk7XG4gIGptcFsweDdmXSA9IF9jYm9yX3N0cmVhbShhc191dGY4X3N0cmVhbSk7XG4gIGptcFsweDlmXSA9IF9jYm9yX3N0cmVhbShhc19hcnJheV9zdHJlYW0pO1xuICBqbXBbMHhiZl0gPSBfY2Jvcl9zdHJlYW0oYXNfbWFwX3N0cmVhbSk7XG5cbiAgLy8gc2VtYW50aWMgdGFnXG5cbiAgLy8gcHJpbWl0aXZlc1xuICBqbXBbMHhmNF0gPSBiaW5kX2Nib3JfdmFsdWUoZmFsc2UpO1xuICBqbXBbMHhmNV0gPSBiaW5kX2Nib3JfdmFsdWUodHJ1ZSk7XG4gIGptcFsweGY2XSA9IGJpbmRfY2Jvcl92YWx1ZShudWxsKTtcbiAgam1wWzB4ZjddID0gYmluZF9jYm9yX3ZhbHVlKHZvaWQgMCk7XG4gIGptcFsweGY4XSA9IF9jYm9yX3cxKHNpbXBsZV92YWx1ZSk7XG4gIGptcFsweGY5XSA9IGhhbGZfZmxvYXQ7XG4gIGptcFsweGZhXSA9IHNpbmdsZV9mbG9hdDtcbiAgam1wWzB4ZmJdID0gZG91YmxlX2Zsb2F0O1xuICAvL2ptcFsweGZjXSA9IHVuZGVmaW5lZFxuICAvL2ptcFsweGZkXSA9IHVuZGVmaW5lZFxuICAvL2ptcFsweGZlXSA9IHVuZGVmaW5lZFxuICBqbXBbMHhmZl0gPSBfY2Jvcl9icmVhaztcblxuICByZXR1cm4gYmluZF9jYm9yX3U4X2RlY29kZShqbXApfVxuXG5mdW5jdGlvbiBfY2Jvcl90aW55KGFzX3R5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IF9jYm9yX3RpbnknKX0gfVxuZnVuY3Rpb24gX2Nib3JfdzEoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBfY2Jvcl93MScpfSB9XG5mdW5jdGlvbiBfY2Jvcl93MigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IF9jYm9yX3cyJyl9IH1cbmZ1bmN0aW9uIF9jYm9yX3c0KCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogX2Nib3JfdzQnKX0gfVxuZnVuY3Rpb24gX2Nib3JfdzgoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBfY2Jvcl93OCcpfSB9XG5mdW5jdGlvbiBfY2Jvcl9zdHJlYW0oKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBfY2Jvcl9zdHJlYW0nKX0gfVxuXG5mdW5jdGlvbiBfY2Jvcl9icmVhaygpIHtcbiAgY29uc29sZS5kaXIoe2JyZWFrOiB0cnVlfSk7XG4gIHRocm93IG5ldyBFcnJvcignVE9ETzogYnJlYWsnKSB9XG5cbmZ1bmN0aW9uIGJpbmRfY2Jvcl92YWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5kaXIoe3ZhbHVlfSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUT0RPOiB2YWx1ZScpIH0gfVxuXG5mdW5jdGlvbiBoYWxmX2Zsb2F0KCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGhhbGZfZmxvYXQnKSB9XG5mdW5jdGlvbiBzaW5nbGVfZmxvYXQoKSB7XG4gIHRocm93IG5ldyBFcnJvcignVE9ETzogc2luZ2xlX2Zsb2F0JykgfVxuZnVuY3Rpb24gZG91YmxlX2Zsb2F0KCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGRvdWJsZV9mbG9hdCcpIH1cblxuZnVuY3Rpb24gYmluZF9zaW1wbGVfdmFsdWUoc2ltcGxlX2x1dCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUT0RPOiBzaW1wbGUnKSB9IH1cblxuZnVuY3Rpb24gYXNfcG9zX2ludCgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGFzX3Bvc19pbnQnKX1cbmZ1bmN0aW9uIGFzX25lZ19pbnQoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc19uZWdfaW50Jyl9XG5mdW5jdGlvbiBhc19ieXRlcygpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGFzX2J5dGVzJyl9XG5mdW5jdGlvbiBhc191dGY4KCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfdXRmOCcpfVxuZnVuY3Rpb24gYXNfYXJyYXkoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc19hcnJheScpfVxuZnVuY3Rpb24gYXNfbWFwKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfbWFwJyl9XG5mdW5jdGlvbiBhc190YWcoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc190YWcnKX1cblxuZnVuY3Rpb24gYXNfYnl0ZXNfc3RyZWFtKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfYnl0ZXNfc3RyZWFtJyl9XG5mdW5jdGlvbiBhc191dGY4X3N0cmVhbSgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGFzX3V0Zjhfc3RyZWFtJyl9XG5mdW5jdGlvbiBhc19hcnJheV9zdHJlYW0oKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc19hcnJheV9zdHJlYW0nKX1cbmZ1bmN0aW9uIGFzX21hcF9zdHJlYW0oKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc19tYXBfc3RyZWFtJyl9XG5cbmV4cG9ydCBkZWZhdWx0IGNib3JfdThfZGVjb2RlO1xuZXhwb3J0IHsgY2Jvcl91OF9kZWNvZGUsIGJpbmRfY2Jvcl91OF9kZWNvZGUsIGNib3JfYmluZF91OF9kZWNvZGVyLCBfY2Jvcl90aW55LCBfY2Jvcl93MSwgX2Nib3JfdzIsIF9jYm9yX3c0LCBfY2Jvcl93OCwgX2Nib3Jfc3RyZWFtIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYm9yX2RlY29kZS5qcy5tYXBcbiIsImNvbnN0IHthc3NlcnR9ID0gcmVxdWlyZSgnY2hhaScpXG5pbXBvcnQgdGVzdF92ZWN0b3JzIGZyb20gJy4vdGVzdF92ZWN0b3JzX19hcHBlbmRpeF9hLmpzeSdcblxuI0lGIFBMQVRfTk9ERUpTXG4gIGltcG9ydCBjYm9yX3U4X2RlY29kZSBmcm9tICdjYm9yLWNvZGVjL2VzbS9jYm9yX2RlY29kZS5qcydcblxuICBmdW5jdGlvbiBiYXNlNjRfdG9fdTgoc3RyX2I2NCkgOjpcbiAgICByZXR1cm4gVWludDhBcnJheS5mcm9tIEAgQnVmZmVyLmZyb20oc3RyX2I2NCwgJ2Jhc2U2NCcpXG5cbiNFTElGIFBMQVRfV0VCXG4gIGltcG9ydCBjYm9yX3U4X2RlY29kZSBmcm9tICdjYm9yLWNvZGVjL2VzbS93ZWIvY2Jvcl9kZWNvZGUuanMnXG5cbiAgY29uc3QgX2NoYXJDb2RlQXQgPSAnJy5jaGFyQ29kZUF0XG4gIGZ1bmN0aW9uIGJhc2U2NF90b191OChzdHJfYjY0KSA6OlxuICAgIGNvbnN0IHN6ID0gYXRvYiBAIHN0cl9iNjQucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKVxuICAgIGNvbnN0IGxlbiA9IHN6Lmxlbmd0aFxuICAgIGNvbnN0IHJlcyA9IG5ldyBVaW50OEFycmF5KGxlbilcbiAgICBmb3IgbGV0IGk9MDsgaTxsZW47IGkrKyA6OlxuICAgICAgcmVzW2ldID0gX2NoYXJDb2RlQXQuY2FsbChzeiwgaSlcbiAgICByZXR1cm4gcmVzXG5cblxuZGVzY3JpYmUgQCAnQ0JPUiBEZWNvZGUgVGVzdCBWZWN0b3JzJywgQD0+IDo6XG4gIGZvciBjb25zdCB0ZXN0IG9mIHRlc3RfdmVjdG9ycyA6OlxuXG4gICAgY29uc3QgaXRfZm4gPSB0ZXN0LnNraXAgPyBpdC5za2lwIDogdGVzdC5vbmx5ID8gaXQub25seSA6IHRlc3QuZW5hYmxlZCA/IGl0IDogaXQuc2tpcFxuICAgIGl0X2ZuIEAgYGNib3JfdThfZGVjb2RlIFwiJHt0ZXN0LmhleH1cIiB0byAke3Rlc3QuZGlhZ25vc3RpYyB8fCBKU09OLnN0cmluZ2lmeSh0ZXN0LmRlY29kZWQpfWAsIEA9PiA6OlxuICAgICAgY29uc3QgdTggPSBiYXNlNjRfdG9fdTggQCB0ZXN0LmNib3JcblxuICAgICAgY29uc3QgYW5zID0gY2Jvcl91OF9kZWNvZGUodTgpXG4gICAgICBpZiB0ZXN0LmRpYWdub3N0aWMgOjpcbiAgICAgICAgYXNzZXJ0Lm9rIEAgZmFsc2UsICdUT0RPOiBkaWFnbm9zdGljJ1xuICAgICAgZWxzZSA6OlxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsIEAgYW5zLCB0ZXN0LmRlY29kZWRcblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztNQUVJO01BQ0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFNBQVM7OztNQUdULE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxTQUFTOzs7TUFHVCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFNBQVM7OztNQUdULE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxTQUFTOzs7TUFHVCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7OztNQUtBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxTQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtTQUNHO1NBQ0E7OztNQUdMLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFO1FBQ0E7OztNQUdGLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7OztNQUlBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRSxHQUFHO1FBQ0gsR0FBRztVQUNEO1VBQ0E7OztNQUdKLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFO1NBQ0ksR0FBRyxFQUFFOzs7TUFHWCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRSxHQUFHLEVBQUU7UUFDTCxHQUFHLEVBQUU7UUFDTCxHQUFHLEVBQUU7UUFDTCxHQUFHLEVBQUU7UUFDTCxHQUFHLEVBQUU7Ozs7TUFJUCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFNBQVM7OztNQUdULE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0U7U0FDRztTQUNBOzs7TUFHTCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtTQUNHO1NBQ0E7OztNQUdMLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFO1NBQ0c7U0FDQTs7O01BR0wsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0U7U0FDRztTQUNBOzs7TUFHTCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtRQUNBOzs7TUFHRixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRSxHQUFHO1FBQ0gsR0FBRyxFQUFLOzs7O01BSVYsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0U7U0FDSSxHQUFHLEVBQUU7OztNQUdYLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFLEtBQUs7UUFDTCxLQUFLOztFQ3JoQlg7O0VBRUE7SUFDRTtJQUNBOztJQUVBO01BQ0U7TUFDQTtNQUNBOztFQUVKO0lBQ0U7O0lBRUE7O0lBRUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7SUFFQTs7SUFFQTtNQUNFO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7O0lBRUY7SUFDQTtNQUNFO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTs7SUFFRjtJQUNBO0lBQ0E7SUFDQTs7Ozs7SUFLQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOzs7O0lBSUE7O0lBRUE7O0VBRUY7SUFDRSxvQ0FBb0Msa0JBQWtCO0VBQ3hEO0lBQ0Usb0NBQW9DLGdCQUFnQjtFQUN0RDtJQUNFLG9DQUFvQyxnQkFBZ0I7RUFDdEQ7SUFDRSxvQ0FBb0MsZ0JBQWdCO0VBQ3REO0lBQ0Usb0NBQW9DLGdCQUFnQjtFQUN0RDtJQUNFLG9DQUFvQyxvQkFBb0I7O0VBRTFEO0lBQ0U7SUFDQSxnQkFBZ0IsYUFBYTs7RUFFL0I7SUFDRTtNQUNFO01BQ0EsZ0JBQWdCLGFBQWE7O0VBRWpDO0lBQ0UsZ0JBQWdCLGtCQUFrQjtFQUNwQztJQUNFLGdCQUFnQixvQkFBb0I7RUFDdEM7SUFDRSxnQkFBZ0Isb0JBQW9COztFQUV0QztJQUNFO01BQ0UsZ0JBQWdCLGNBQWM7O0VBRWxDLHVDQUF1QyxrQkFBa0I7RUFDekQsdUNBQXVDLGtCQUFrQjtFQUN6RCxxQ0FBcUMsZ0JBQWdCO0VBQ3JELG9DQUFvQyxlQUFlO0VBQ25ELHFDQUFxQyxnQkFBZ0I7RUFDckQsbUNBQW1DLGNBQWM7RUFDakQsbUNBQW1DLGNBQWM7O0VBRWpELDRDQUE0Qyx1QkFBdUI7RUFDbkUsMkNBQTJDLHNCQUFzQjtFQUNqRSw0Q0FBNEMsdUJBQXVCO0VBQ25FLDBDQUEwQyxxQkFBcUI7OztFQ3BIL0QseUJBQXlCLE1BQU07QUFDL0I7d0JBV3NCOzswQ0FFb0IsS0FBSyxjQUFjLE1BQUs7Ozs7Ozs7O0VBUWxFLFNBQVUsMEJBQTJCO0lBQ25DLEtBQUc7O01BRUQ7TUFDQSxNQUFPLG1CQUFvQixTQUFTLE9BQU8sZ0RBQWdELENBQUM7UUFDMUYsd0JBQXlCOztRQUV6QjtRQUNBLElBQUU7VUFDQSxVQUFXLE9BQVE7O1VBRW5CLGlCQUFrQjs7OzsifQ==
