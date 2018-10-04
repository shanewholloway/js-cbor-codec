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

function base64_to_u8(str_b64) {
  return Uint8Array.from(Buffer.from(str_b64, 'base64')) }














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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX191bml0dGVzdC5janMuanMiLCJzb3VyY2VzIjpbInRlc3RfdmVjdG9yc19fYXBwZW5kaXhfYS5qc3kiLCIuLi9lc20vY2Jvcl9kZWNvZGUuanMiLCJ1bml0dGVzdC5qc3kiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgQFtdXG4gIEB7fVxuICAgIGVuYWJsZWQ6IHRydWVcbiAgICBjYm9yOiBcIkFBPT1cIlxuICAgIGhleDogXCIwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiQVE9PVwiXG4gICAgaGV4OiBcIjAxXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxXG5cbiAgQHt9XG4gICAgY2JvcjogXCJDZz09XCJcbiAgICBoZXg6IFwiMGFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJGdz09XCJcbiAgICBoZXg6IFwiMTdcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDIzXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHQmc9XCJcbiAgICBoZXg6IFwiMTgxOFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMjRcblxuICBAe31cbiAgICBjYm9yOiBcIkdCaz1cIlxuICAgIGhleDogXCIxODE5XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAyNVxuXG4gIEB7fVxuICAgIGNib3I6IFwiR0dRPVwiXG4gICAgaGV4OiBcIjE4NjRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiR1FQb1wiXG4gICAgaGV4OiBcIjE5MDNlOFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiR2dBUFFrQT1cIlxuICAgIGhleDogXCIxYTAwMGY0MjQwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxMDAwMDAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHd0FBQU9qVXBSQUFcIlxuICAgIGhleDogXCIxYjAwMDAwMGU4ZDRhNTEwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMDAwMDAwMDAwMDBcblxuICBAe31cbiAgICBjYm9yOiBcIkcvLy8vLy8vLy8vL1wiXG4gICAgaGV4OiBcIjFiZmZmZmZmZmZmZmZmZmZmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTg0NDY3NDQwNzM3MDk1NTE2MTVcblxuICBAe31cbiAgICBjYm9yOiBcIndra0JBQUFBQUFBQUFBQT1cIlxuICAgIGhleDogXCJjMjQ5MDEwMDAwMDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxODQ0Njc0NDA3MzcwOTU1MTYxNlxuXG4gIEB7fVxuICAgIGNib3I6IFwiTy8vLy8vLy8vLy8vXCJcbiAgICBoZXg6IFwiM2JmZmZmZmZmZmZmZmZmZmZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTg0NDY3NDQwNzM3MDk1NTE2MTZcblxuICBAe31cbiAgICBjYm9yOiBcIncwa0JBQUFBQUFBQUFBQT1cIlxuICAgIGhleDogXCJjMzQ5MDEwMDAwMDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTg0NDY3NDQwNzM3MDk1NTE2MTdcblxuICBAe31cbiAgICBjYm9yOiBcIklBPT1cIlxuICAgIGhleDogXCIyMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTFcblxuICBAe31cbiAgICBjYm9yOiBcIktRPT1cIlxuICAgIGhleDogXCIyOVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTEwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJPR009XCJcbiAgICBoZXg6IFwiMzg2M1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTEwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiT1FQblwiXG4gICAgaGV4OiBcIjM5MDNlN1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTEwMDBcblxuICBAe31cbiAgICBjYm9yOiBcIitRQUFcIlxuICAgIGhleDogXCJmOTAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDAuMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1lBQVwiXG4gICAgaGV4OiBcImY5ODAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTAuMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1R3QVwiXG4gICAgaGV4OiBcImY5M2MwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMS4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrei94bVptWm1abWFcIlxuICAgIGhleDogXCJmYjNmZjE5OTk5OTk5OTk5OWFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEuMVxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1Q0QVwiXG4gICAgaGV4OiBcImY5M2UwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMS41XG5cbiAgQHt9XG4gICAgY2JvcjogXCIrWHYvXCJcbiAgICBoZXg6IFwiZjk3YmZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiA2NTUwNC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIra2ZEVUFBPVwiXG4gICAgaGV4OiBcImZhNDdjMzUwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMDAwMC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrbjkvLy84PVwiXG4gICAgaGV4OiBcImZhN2Y3ZmZmZmZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzhcblxuICBAe31cbiAgICBjYm9yOiBcIiszNDM1RHlJQUhXY1wiXG4gICAgaGV4OiBcImZiN2UzN2U0M2M4ODAwNzU5Y1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMS4wZSszMDBcblxuICBAe31cbiAgICBjYm9yOiBcIitRQUJcIlxuICAgIGhleDogXCJmOTAwMDFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDUuOTYwNDY0NDc3NTM5MDYzZS0wOFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1FRQVwiXG4gICAgaGV4OiBcImY5MDQwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogNi4xMDM1MTU2MjVlLTA1XG5cbiAgQHt9XG4gICAgY2JvcjogXCIrY1FBXCJcbiAgICBoZXg6IFwiZjljNDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtNC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrOEFRWm1abVptWm1cIlxuICAgIGhleDogXCJmYmMwMTA2NjY2NjY2NjY2NjZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC00LjFcblxuICBAe31cbiAgICBjYm9yOiBcIitYd0FcIlxuICAgIGhleDogXCJmOTdjMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1g0QVwiXG4gICAgaGV4OiBcImY5N2UwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJOYU5cIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK2Z3QVwiXG4gICAgaGV4OiBcImY5ZmMwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCItSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK24rQUFBQT1cIlxuICAgIGhleDogXCJmYTdmODAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCJJbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrbi9BQUFBPVwiXG4gICAgaGV4OiBcImZhN2ZjMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIk5hTlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrditBQUFBPVwiXG4gICAgaGV4OiBcImZhZmY4MDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIi1JbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrMy93QUFBQUFBQUFcIlxuICAgIGhleDogXCJmYjdmZjAwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIkluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIiszLzRBQUFBQUFBQVwiXG4gICAgaGV4OiBcImZiN2ZmODAwMDAwMDAwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiTmFOXCJcblxuICBAe31cbiAgICBjYm9yOiBcIisvL3dBQUFBQUFBQVwiXG4gICAgaGV4OiBcImZiZmZmMDAwMDAwMDAwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiLUluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIjlBPT1cIlxuICAgIGhleDogXCJmNFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogZmFsc2VcblxuICBAe31cbiAgICBjYm9yOiBcIjlRPT1cIlxuICAgIGhleDogXCJmNVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogdHJ1ZVxuXG4gIEB7fVxuICAgIGNib3I6IFwiOWc9PVwiXG4gICAgaGV4OiBcImY2XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBudWxsXG5cbiAgQHt9XG4gICAgY2JvcjogXCI5dz09XCJcbiAgICBoZXg6IFwiZjdcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwidW5kZWZpbmVkXCJcblxuICBAe31cbiAgICBjYm9yOiBcIjhBPT1cIlxuICAgIGhleDogXCJmMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJzaW1wbGUoMTYpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIitCZz1cIlxuICAgIGhleDogXCJmODE4XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcInNpbXBsZSgyNClcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1A4PVwiXG4gICAgaGV4OiBcImY4ZmZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwic2ltcGxlKDI1NSlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwid0hReU1ERXpMVEF6TFRJeFZESXdPakEwT2pBd1dnPT1cIlxuICAgIGhleDogXCJjMDc0MzIzMDMxMzMyZDMwMzMyZDMyMzE1NDMyMzAzYTMwMzQzYTMwMzA1YVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIwKFxcXCIyMDEzLTAzLTIxVDIwOjA0OjAwWlxcXCIpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIndScFJTMmV3XCJcbiAgICBoZXg6IFwiYzExYTUxNGI2N2IwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjEoMTM2Mzg5NjI0MClcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwid2Z0QjFGTFo3Q0FBQUE9PVwiXG4gICAgaGV4OiBcImMxZmI0MWQ0NTJkOWVjMjAwMDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjEoMTM2Mzg5NjI0MC41KVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIxMFFCQWdNRVwiXG4gICAgaGV4OiBcImQ3NDQwMTAyMDMwNFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIyMyhoJzAxMDIwMzA0JylcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiMkJoRlpFbEZWRVk9XCJcbiAgICBoZXg6IFwiZDgxODQ1NjQ0OTQ1NTQ0NlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIyNChoJzY0NDk0NTU0NDYnKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIyQ0IyYUhSMGNEb3ZMM2QzZHk1bGVHRnRjR3hsTG1OdmJRPT1cIlxuICAgIGhleDogXCJkODIwNzY2ODc0NzQ3MDNhMmYyZjc3Nzc3NzJlNjU3ODYxNmQ3MDZjNjUyZTYzNmY2ZFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIzMihcXFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbVxcXCIpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIlFBPT1cIlxuICAgIGhleDogXCI0MFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJoJydcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiUkFFQ0F3UT1cIlxuICAgIGhleDogXCI0NDAxMDIwMzA0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcImgnMDEwMjAzMDQnXCJcblxuICBAe31cbiAgICBjYm9yOiBcIllBPT1cIlxuICAgIGhleDogXCI2MFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCJcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWVdFPVwiXG4gICAgaGV4OiBcIjYxNjFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwiYVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJaRWxGVkVZPVwiXG4gICAgaGV4OiBcIjY0NDk0NTU0NDZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwiSUVURlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZaUpjXCJcbiAgICBoZXg6IFwiNjIyMjVjXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIlxcXCJcXFxcXCJcblxuICBAe31cbiAgICBjYm9yOiBcIllzTzhcIlxuICAgIGhleDogXCI2MmMzYmNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwiw7xcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWSthd3RBPT1cIlxuICAgIGhleDogXCI2M2U2YjBiNFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCLmsLRcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWlBDUWhaRT1cIlxuICAgIGhleDogXCI2NGYwOTA4NTkxXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIvCQhZFcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiZ0E9PVwiXG4gICAgaGV4OiBcIjgwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBbXG5cbiAgICBdXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0VDQXc9PVwiXG4gICAgaGV4OiBcIjgzMDEwMjAzXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW10gMSwgMiwgM1xuXG4gIEB7fVxuICAgIGNib3I6IFwiZ3dHQ0FnT0NCQVU9XCJcbiAgICBoZXg6IFwiODMwMTgyMDIwMzgyMDQwNVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcIm1Ca0JBZ01FQlFZSENBa0tDd3dORGc4UUVSSVRGQlVXRnhnWUdCaz1cIlxuICAgIGhleDogXCI5ODE5MDEwMjAzMDQwNTA2MDcwODA5MGEwYjBjMGQwZTBmMTAxMTEyMTMxNDE1MTYxNzE4MTgxODE5XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LFxuICAgICAgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNVxuXG4gIEB7fVxuICAgIGNib3I6IFwib0E9PVwiXG4gICAgaGV4OiBcImEwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAe31cblxuXG4gIEB7fVxuICAgIGNib3I6IFwib2dFQ0F3UT1cIlxuICAgIGhleDogXCJhMjAxMDIwMzA0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcInsxOiAyLCAzOiA0fVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJvbUZoQVdGaWdnSURcIlxuICAgIGhleDogXCJhMjYxNjEwMTYxNjI4MjAyMDNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEB7fVxuICAgICAgXCJhXCI6IDFcbiAgICAgIFwiYlwiOiBAW11cbiAgICAgICAgMlxuICAgICAgICAzXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnbUZob1dGaVlXTT1cIlxuICAgIGhleDogXCI4MjYxNjFhMTYxNjI2MTYzXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIFwiYVwiXG4gICAgICBAe30gXCJiXCI6IFwiY1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJwV0ZoWVVGaFltRkNZV05oUTJGa1lVUmhaV0ZGXCJcbiAgICBoZXg6IFwiYTU2MTYxNjE0MTYxNjI2MTQyNjE2MzYxNDM2MTY0NjE0NDYxNjU2MTQ1XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAe31cbiAgICAgIFwiYVwiOiBcIkFcIlxuICAgICAgXCJiXCI6IFwiQlwiXG4gICAgICBcImNcIjogXCJDXCJcbiAgICAgIFwiZFwiOiBcIkRcIlxuICAgICAgXCJlXCI6IFwiRVwiXG5cblxuICBAe31cbiAgICBjYm9yOiBcIlgwSUJBa01EQkFYL1wiXG4gICAgaGV4OiBcIjVmNDIwMTAyNDMwMzA0MDVmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiKF8gaCcwMTAyJywgaCcwMzA0MDUnKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJmMlZ6ZEhKbFlXUnRhVzVuL3c9PVwiXG4gICAgaGV4OiBcIjdmNjU3Mzc0NzI2NTYxNjQ2ZDY5NmU2N2ZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogXCJzdHJlYW1pbmdcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwibi84PVwiXG4gICAgaGV4OiBcIjlmZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBbXVxuXG4gIEB7fVxuICAgIGNib3I6IFwibndHQ0FnT2ZCQVgvL3c9PVwiXG4gICAgaGV4OiBcIjlmMDE4MjAyMDM5ZjA0MDVmZmZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcIm53R0NBZ09DQkFYL1wiXG4gICAgaGV4OiBcIjlmMDE4MjAyMDM4MjA0MDVmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMVxuICAgICAgQFtdIDIsIDNcbiAgICAgIEBbXSA0LCA1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0dDQWdPZkJBWC9cIlxuICAgIGhleDogXCI4MzAxODIwMjAzOWYwNDA1ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwiZ3dHZkFnUC9nZ1FGXCJcbiAgICBoZXg6IFwiODMwMTlmMDIwM2ZmODIwNDA1XCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcIm53RUNBd1FGQmdjSUNRb0xEQTBPRHhBUkVoTVVGUllYR0JnWUdmOD1cIlxuICAgIGhleDogXCI5ZjAxMDIwMzA0MDUwNjA3MDgwOTBhMGIwYzBkMGUwZjEwMTExMjEzMTQxNTE2MTcxODE4MTgxOWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNlxuICAgICAgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNVxuXG4gIEB7fVxuICAgIGNib3I6IFwidjJGaEFXRmlud0lELy84PVwiXG4gICAgaGV4OiBcImJmNjE2MTAxNjE2MjlmMDIwM2ZmZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAe31cbiAgICAgIFwiYVwiOiAxXG4gICAgICBcImJcIjogQFtdIDIsIDNcblxuXG4gIEB7fVxuICAgIGNib3I6IFwiZ21GaHYyRmlZV1AvXCJcbiAgICBoZXg6IFwiODI2MTYxYmY2MTYyNjE2M2ZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICBcImFcIlxuICAgICAgQHt9IFwiYlwiOiBcImNcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwidjJOR2RXNzFZMEZ0ZENIL1wiXG4gICAgaGV4OiBcImJmNjM0Njc1NmVmNTYzNDE2ZDc0MjFmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEB7fVxuICAgICAgXCJGdW5cIjogdHJ1ZVxuICAgICAgXCJBbXRcIjogLTJcbiIsImNvbnN0IGNib3JfdThfZGVjb2RlID0gY2Jvcl9iaW5kX3U4X2RlY29kZXIoKTtcblxuZnVuY3Rpb24gYmluZF9jYm9yX3U4X2RlY29kZShqbXApIHtcbiAgY2Jvcl91OF9kZWNvZGUuam1wID0gam1wO1xuICByZXR1cm4gY2Jvcl91OF9kZWNvZGVcblxuICBmdW5jdGlvbiBjYm9yX3U4X2RlY29kZSh1OCkge1xuICAgIGNvbnN0IGRpc3AgPSBqbXBbdThbMF1dO1xuICAgIGNvbnNvbGUubG9nKFt1OFswXSwgZGlzcF0pO1xuICAgIHJldHVybiBkaXNwKHU4KX0gfVxuXG5mdW5jdGlvbiBjYm9yX2JpbmRfdThfZGVjb2RlcihvcHRpb25zKSB7XG4gIGlmIChudWxsID09IG9wdGlvbnMpIHtvcHRpb25zID0ge307fVxuXG4gIGNvbnN0IHNpbXBsZV92YWx1ZSA9IGJpbmRfc2ltcGxlX3ZhbHVlKG9wdGlvbnMuc2ltcGxlKTtcblxuICBjb25zdCB0aW55X3Bvc19pbnQgPSBfY2Jvcl90aW55KGFzX3Bvc19pbnQpO1xuICBjb25zdCB0aW55X25lZ19pbnQgPSBfY2Jvcl90aW55KGFzX25lZ19pbnQpO1xuICBjb25zdCB0aW55X2J5dGVzID0gX2Nib3JfdGlueShhc19ieXRlcyk7XG4gIGNvbnN0IHRpbnlfdXRmOCA9IF9jYm9yX3RpbnkoYXNfdXRmOCk7XG4gIGNvbnN0IHRpbnlfYXJyYXkgPSBfY2Jvcl90aW55KGFzX2FycmF5KTtcbiAgY29uc3QgdGlueV9tYXAgPSBfY2Jvcl90aW55KGFzX21hcCk7XG4gIGNvbnN0IHRpbnlfdGFnID0gX2Nib3JfdGlueShhc190YWcpO1xuICBjb25zdCB0aW55X3NpbXBsZSA9IF9jYm9yX3Rpbnkoc2ltcGxlX3ZhbHVlKTtcblxuICBjb25zdCBqbXAgPSBbXTtcblxuICBmb3IgKGxldCBpPTA7IGk8PSAyMzsgaSsrKSB7XG4gICAgam1wWzB4MDAgfCBpXSA9IHRpbnlfcG9zX2ludDtcbiAgICBqbXBbMHgyMCB8IGldID0gdGlueV9uZWdfaW50O1xuICAgIGptcFsweDQwIHwgaV0gPSB0aW55X2J5dGVzO1xuICAgIGptcFsweDYwIHwgaV0gPSB0aW55X3V0Zjg7XG4gICAgam1wWzB4ODAgfCBpXSA9IHRpbnlfYXJyYXk7XG4gICAgam1wWzB4YTAgfCBpXSA9IHRpbnlfbWFwO1xuICAgIGptcFsweGMwIHwgaV0gPSB0aW55X3RhZztcbiAgICBqbXBbMHhlMCB8IGldID0gdGlueV9zaW1wbGU7fVxuXG4gIGNvbnN0IGNib3Jfd2lkdGhzID1bX2Nib3JfdzEsIF9jYm9yX3cyLCBfY2Jvcl93NCwgX2Nib3JfdzhdO1xuICBmb3IgKGxldCB3PTA7IHc8IDQ7IHcrKykge1xuICAgIGNvbnN0IGkgPSAyNCt3LCB3aWR0aCA9IGNib3Jfd2lkdGhzW3ddO1xuICAgIGptcFsweDAwIHwgaV0gPSB3aWR0aChhc19wb3NfaW50KTtcbiAgICBqbXBbMHgyMCB8IGldID0gd2lkdGgoYXNfbmVnX2ludCk7XG4gICAgam1wWzB4NDAgfCBpXSA9IHdpZHRoKGFzX2J5dGVzKTtcbiAgICBqbXBbMHg2MCB8IGldID0gd2lkdGgoYXNfdXRmOCk7XG4gICAgam1wWzB4ODAgfCBpXSA9IHdpZHRoKGFzX2FycmF5KTtcbiAgICBqbXBbMHhhMCB8IGldID0gd2lkdGgoYXNfbWFwKTtcbiAgICBqbXBbMHhjMCB8IGldID0gd2lkdGgoYXNfdGFnKTtcbiAgICBqbXBbMHhlMCB8IGldID0gd2lkdGgoc2ltcGxlX3ZhbHVlKTsgfVxuXG4gIGptcFsweDVmXSA9IF9jYm9yX3N0cmVhbShhc19ieXRlc19zdHJlYW0pO1xuICBqbXBbMHg3Zl0gPSBfY2Jvcl9zdHJlYW0oYXNfdXRmOF9zdHJlYW0pO1xuICBqbXBbMHg5Zl0gPSBfY2Jvcl9zdHJlYW0oYXNfYXJyYXlfc3RyZWFtKTtcbiAgam1wWzB4YmZdID0gX2Nib3Jfc3RyZWFtKGFzX21hcF9zdHJlYW0pO1xuXG4gIC8vIHNlbWFudGljIHRhZ1xuXG4gIC8vIHByaW1pdGl2ZXNcbiAgam1wWzB4ZjRdID0gYmluZF9jYm9yX3ZhbHVlKGZhbHNlKTtcbiAgam1wWzB4ZjVdID0gYmluZF9jYm9yX3ZhbHVlKHRydWUpO1xuICBqbXBbMHhmNl0gPSBiaW5kX2Nib3JfdmFsdWUobnVsbCk7XG4gIGptcFsweGY3XSA9IGJpbmRfY2Jvcl92YWx1ZSh2b2lkIDApO1xuICBqbXBbMHhmOF0gPSBfY2Jvcl93MShzaW1wbGVfdmFsdWUpO1xuICBqbXBbMHhmOV0gPSBoYWxmX2Zsb2F0O1xuICBqbXBbMHhmYV0gPSBzaW5nbGVfZmxvYXQ7XG4gIGptcFsweGZiXSA9IGRvdWJsZV9mbG9hdDtcbiAgLy9qbXBbMHhmY10gPSB1bmRlZmluZWRcbiAgLy9qbXBbMHhmZF0gPSB1bmRlZmluZWRcbiAgLy9qbXBbMHhmZV0gPSB1bmRlZmluZWRcbiAgam1wWzB4ZmZdID0gX2Nib3JfYnJlYWs7XG5cbiAgcmV0dXJuIGJpbmRfY2Jvcl91OF9kZWNvZGUoam1wKX1cblxuZnVuY3Rpb24gX2Nib3JfdGlueShhc190eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBfY2Jvcl90aW55Jyl9IH1cbmZ1bmN0aW9uIF9jYm9yX3cxKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogX2Nib3JfdzEnKX0gfVxuZnVuY3Rpb24gX2Nib3JfdzIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBfY2Jvcl93MicpfSB9XG5mdW5jdGlvbiBfY2Jvcl93NCgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IF9jYm9yX3c0Jyl9IH1cbmZ1bmN0aW9uIF9jYm9yX3c4KCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogX2Nib3JfdzgnKX0gfVxuZnVuY3Rpb24gX2Nib3Jfc3RyZWFtKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogX2Nib3Jfc3RyZWFtJyl9IH1cblxuZnVuY3Rpb24gX2Nib3JfYnJlYWsoKSB7XG4gIGNvbnNvbGUuZGlyKHticmVhazogdHJ1ZX0pO1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGJyZWFrJykgfVxuXG5mdW5jdGlvbiBiaW5kX2Nib3JfdmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUuZGlyKHt2YWx1ZX0pO1xuICAgIHRocm93IG5ldyBFcnJvcignVE9ETzogdmFsdWUnKSB9IH1cblxuZnVuY3Rpb24gaGFsZl9mbG9hdCgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdUT0RPOiBoYWxmX2Zsb2F0JykgfVxuZnVuY3Rpb24gc2luZ2xlX2Zsb2F0KCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IHNpbmdsZV9mbG9hdCcpIH1cbmZ1bmN0aW9uIGRvdWJsZV9mbG9hdCgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdUT0RPOiBkb3VibGVfZmxvYXQnKSB9XG5cbmZ1bmN0aW9uIGJpbmRfc2ltcGxlX3ZhbHVlKHNpbXBsZV9sdXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVE9ETzogc2ltcGxlJykgfSB9XG5cbmZ1bmN0aW9uIGFzX3Bvc19pbnQoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc19wb3NfaW50Jyl9XG5mdW5jdGlvbiBhc19uZWdfaW50KCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfbmVnX2ludCcpfVxuZnVuY3Rpb24gYXNfYnl0ZXMoKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc19ieXRlcycpfVxuZnVuY3Rpb24gYXNfdXRmOCgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGFzX3V0ZjgnKX1cbmZ1bmN0aW9uIGFzX2FycmF5KCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfYXJyYXknKX1cbmZ1bmN0aW9uIGFzX21hcCgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGFzX21hcCcpfVxuZnVuY3Rpb24gYXNfdGFnKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfdGFnJyl9XG5cbmZ1bmN0aW9uIGFzX2J5dGVzX3N0cmVhbSgpIHt0aHJvdyBuZXcgRXJyb3IoJ1RPRE86IGFzX2J5dGVzX3N0cmVhbScpfVxuZnVuY3Rpb24gYXNfdXRmOF9zdHJlYW0oKSB7dGhyb3cgbmV3IEVycm9yKCdUT0RPOiBhc191dGY4X3N0cmVhbScpfVxuZnVuY3Rpb24gYXNfYXJyYXlfc3RyZWFtKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfYXJyYXlfc3RyZWFtJyl9XG5mdW5jdGlvbiBhc19tYXBfc3RyZWFtKCkge3Rocm93IG5ldyBFcnJvcignVE9ETzogYXNfbWFwX3N0cmVhbScpfVxuXG5leHBvcnQgZGVmYXVsdCBjYm9yX3U4X2RlY29kZTtcbmV4cG9ydCB7IGNib3JfdThfZGVjb2RlLCBiaW5kX2Nib3JfdThfZGVjb2RlLCBjYm9yX2JpbmRfdThfZGVjb2RlciwgX2Nib3JfdGlueSwgX2Nib3JfdzEsIF9jYm9yX3cyLCBfY2Jvcl93NCwgX2Nib3JfdzgsIF9jYm9yX3N0cmVhbSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2Jvcl9kZWNvZGUuanMubWFwXG4iLCJjb25zdCB7YXNzZXJ0fSA9IHJlcXVpcmUoJ2NoYWknKVxuaW1wb3J0IHRlc3RfdmVjdG9ycyBmcm9tICcuL3Rlc3RfdmVjdG9yc19fYXBwZW5kaXhfYS5qc3knXG5cbiNJRiBQTEFUX05PREVKU1xuICBpbXBvcnQgY2Jvcl91OF9kZWNvZGUgZnJvbSAnY2Jvci1jb2RlYy9lc20vY2Jvcl9kZWNvZGUuanMnXG5cbiAgZnVuY3Rpb24gYmFzZTY0X3RvX3U4KHN0cl9iNjQpIDo6XG4gICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbSBAIEJ1ZmZlci5mcm9tKHN0cl9iNjQsICdiYXNlNjQnKVxuXG4jRUxJRiBQTEFUX1dFQlxuICBpbXBvcnQgY2Jvcl91OF9kZWNvZGUgZnJvbSAnY2Jvci1jb2RlYy9lc20vd2ViL2Nib3JfZGVjb2RlLmpzJ1xuXG4gIGNvbnN0IF9jaGFyQ29kZUF0ID0gJycuY2hhckNvZGVBdFxuICBmdW5jdGlvbiBiYXNlNjRfdG9fdTgoc3RyX2I2NCkgOjpcbiAgICBjb25zdCBzeiA9IGF0b2IgQCBzdHJfYjY0LnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJylcbiAgICBjb25zdCBsZW4gPSBzei5sZW5ndGhcbiAgICBjb25zdCByZXMgPSBuZXcgVWludDhBcnJheShsZW4pXG4gICAgZm9yIGxldCBpPTA7IGk8bGVuOyBpKysgOjpcbiAgICAgIHJlc1tpXSA9IF9jaGFyQ29kZUF0LmNhbGwoc3osIGkpXG4gICAgcmV0dXJuIHJlc1xuXG5cbmRlc2NyaWJlIEAgJ0NCT1IgRGVjb2RlIFRlc3QgVmVjdG9ycycsIEA9PiA6OlxuICBmb3IgY29uc3QgdGVzdCBvZiB0ZXN0X3ZlY3RvcnMgOjpcblxuICAgIGNvbnN0IGl0X2ZuID0gdGVzdC5za2lwID8gaXQuc2tpcCA6IHRlc3Qub25seSA/IGl0Lm9ubHkgOiB0ZXN0LmVuYWJsZWQgPyBpdCA6IGl0LnNraXBcbiAgICBpdF9mbiBAIGBjYm9yX3U4X2RlY29kZSBcIiR7dGVzdC5oZXh9XCIgdG8gJHt0ZXN0LmRpYWdub3N0aWMgfHwgSlNPTi5zdHJpbmdpZnkodGVzdC5kZWNvZGVkKX1gLCBAPT4gOjpcbiAgICAgIGNvbnN0IHU4ID0gYmFzZTY0X3RvX3U4IEAgdGVzdC5jYm9yXG5cbiAgICAgIGNvbnN0IGFucyA9IGNib3JfdThfZGVjb2RlKHU4KVxuICAgICAgaWYgdGVzdC5kaWFnbm9zdGljIDo6XG4gICAgICAgIGFzc2VydC5vayBAIGZhbHNlLCAnVE9ETzogZGlhZ25vc3RpYydcbiAgICAgIGVsc2UgOjpcbiAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbCBAIGFucywgdGVzdC5kZWNvZGVkXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOztJQUVJO0lBQ0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsU0FBUzs7O0lBR1QsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFNBQVM7OztJQUdULE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxTQUFTOzs7SUFHVCxNQUFNO0lBQ04sS0FBSztJQUNM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
