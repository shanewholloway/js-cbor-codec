'use strict';

function u8_to_hex(u8, sep) {
  if (undefined === u8.buffer) {
    u8 = new Uint8Array(u8);}

  return Array
    .from(u8, v => v.toString(16).padStart(2, '0'))
    .join(null != sep ? sep : '') }


function hex_to_u8(hex) {
  hex = hex.replace(/[^0-9a-fA-F]/g, '');
  const u8 = new Uint8Array(hex.length >> 1);
  for (let i=0, i2=0; i<u8.length; i++, i2+=2) {
    u8[i] = parseInt(hex.slice(i2, i2+2), 16); }
  return u8}

function u8_to_utf8(u8) {
  return Buffer.from(u8).toString('utf-8')}

const { randomBytes, randomFillSync } = require('crypto');

function as_u8_buffer(u8) {
  if (u8 instanceof Uint8Array) {
    return u8}
  if (ArrayBuffer.isView(u8)) {
    return new Uint8Array(u8.buffer)}
  if (u8 instanceof ArrayBuffer) {
    return new Uint8Array(u8)}
  return Uint8Array.from(u8)}

function u8_concat(parts) {
  let i=0, len=0;
  for (const b of parts) {
    const byteLength = b.byteLength;
    if  ('number' !== typeof byteLength) {
      throw new Error("Invalid part byteLength") }
    len += byteLength;}

  const u8 = new Uint8Array(len);
  for (const u8_part of parts) {
    u8.set(u8_part, i);
    i += u8_part.byteLength;}
  return u8}

const decode_types ={
  __proto__: null

, half_float(u8) {return u8}

, bytes(u8) {return u8}
, bytes_stream(decoder) {
    let res = [];
    return function (done, i, u8) {
      if (done) {
        const ans = u8_concat(res);
        res = null;
        return ans}

      res.push(u8);} }

, utf8(u8) {return u8_to_utf8(u8)}
, utf8_stream(decoder) {
    let res = [];
    return function (done, i, str) {
      if (done) {
        const ans = res.join('');
        res = null;
        return ans}

      res.push(str);} }


, empty_list() {return []}

, list(decoder, len) {
    let res = 0 === len ? [] : new Array(len);
    return function (done, i, v) {
      if (done) {return res}
      res[i] = v;} }

, list_stream(decoder) {
    let res = [];
    return function (done, i, v) {
      if (done) {return res}
      res.push(v);} }


, empty_map() {return {}}

, map(decoder) {
    let res = {};
    return function (done, k, v) {
      if (done) {return res}
      res[k] = v;} }

, map_stream(decoder) {
    let res = {};
    return function (done, k, v) {
      if (done) {return res}
      res[k] = v;} }


, Map:{
    __proto__: null

  , empty_map() {return new Map()}

  , map(decoder) {
      let res = new Map();
      return function (done, k, v) {
        if (done) {return res}
        res.set(k, v);} }

  , map_stream(decoder) {
      let res = new Map();
      return function (done, k, v) {
        if (done) {return res}
        res.set(k, v);} } }


, Set:{
    __proto__: null

  , empty_list() {return new Set()}

  , list(decoder) {
      let res = new Set();
      return function (done, i, v) {
        if (done) {return res}
        res.add(v);} }

  , list_stream(decoder) {
      let res = new Set();
      return function (done, i, v) {
        if (done) {return res}
        res.add(v);} } } };

const {URL} = require('url');
function decode_jump(options, jmp) {
  jmp = jmp ? jmp.slice() : decode_basic_jump();

  if (null == options) {options = {};}

  if (options.simple) {
    const simple_value = bind_simple_dispatch(options.simple);
    const tiny_simple = _cbor_tiny(simple_value);

    for (let i=0xe0; i<= 0xf3; i++) {
      jmp[i] = tiny_simple;}

    jmp[0xf8] = _cbor_w1(simple_value); }


  if (options.tags) {
    const as_tag = bind_tag_dispatch(options.tags);
    const tiny_tag = _cbor_tiny(as_tag);

    for (let i=0xc0; i<= 0xd7; i++) {
      jmp[0xc0 | i] = tiny_tag;}

    jmp[0xd8] = _cbor_w1(as_tag);
    jmp[0xd9] = _cbor_w2(as_tag);
    jmp[0xda] = _cbor_w4(as_tag);
    jmp[0xdb] = _cbor_w8(as_tag); }

  return jmp}


function decode_basic_jump() {
  const as_tag = bind_tag_dispatch(basic_tags());

  const tiny_pos_int = _cbor_tiny(as_pos_int);
  const tiny_neg_int = _cbor_tiny(as_neg_int);
  const tiny_bytes = _cbor_tiny(as_bytes);
  const tiny_utf8 = _cbor_tiny(as_utf8);
  const tiny_list = _cbor_tiny(as_list);
  const tiny_map = _cbor_tiny(as_map);
  const tiny_tag = _cbor_tiny(as_tag);
  const tiny_simple_repr = _cbor_tiny(simple_repr);

  const jmp = new Array(256);

  for (let i=0; i<= 23; i++) {
    jmp[0x00 | i] = tiny_pos_int;
    jmp[0x20 | i] = tiny_neg_int;
    jmp[0x40 | i] = tiny_bytes;
    jmp[0x60 | i] = tiny_utf8;
    jmp[0x80 | i] = tiny_list;
    jmp[0xa0 | i] = tiny_map;
    jmp[0xc0 | i] = tiny_tag;
    jmp[0xe0 | i] = tiny_simple_repr;}

  const cbor_widths =[_cbor_w1, _cbor_w2, _cbor_w4, _cbor_w8];
  for (let w=0; w< 4; w++) {
    const i = 24+w, width = cbor_widths[w];
    jmp[0x00 | i] = width(as_pos_int);
    jmp[0x20 | i] = width(as_neg_int);
    jmp[0x40 | i] = width(as_bytes);
    jmp[0x60 | i] = width(as_utf8);
    jmp[0x80 | i] = width(as_list);
    jmp[0xa0 | i] = width(as_map);
    jmp[0xc0 | i] = width(as_tag); }

  // streaming data types
  jmp[0x5f] = as_bytes_stream;
  jmp[0x7f] = as_utf8_stream;
  jmp[0x9f] = as_list_stream;
  jmp[0xbf] = as_map_stream;

  // semantic tag

  // primitives
  jmp[0xf4] = function() {return false};
  jmp[0xf5] = function() {return true};
  jmp[0xf6] = function() {return null};
  jmp[0xf7] = function() {};// undefined
  jmp[0xf8] = _cbor_w1(simple_repr);
  jmp[0xf9] = half_float;
  jmp[0xfa] = single_float;
  jmp[0xfb] = double_float;
  //jmp[0xfc] = undefined
  //jmp[0xfd] = undefined
  //jmp[0xfe] = undefined
  jmp[0xff] = function () {return cbor_break_sym};

  return jmp}


// special token
const cbor_break_sym = Symbol('cbor_break');

// cbor size/value interpreters
function _cbor_tiny(as_type) {
  return function (decoder, type_b) {
    return as_type(decoder, type_b & 0x1f)} }

function _cbor_w1(as_type) {
  return function (decoder) {
    const idx = decoder.idx;
    decoder.idx = idx + 1;
    return as_type(decoder,
      decoder.dv.getUint8(idx)) } }

function _cbor_w2(as_type) {
  return function (decoder) {
    const idx = decoder.idx;
    decoder.idx = idx + 2;
    return as_type(decoder,
      decoder.dv.getUint16(idx)) } }

function _cbor_w4(as_type) {
  return function (decoder) {
    const idx = decoder.idx;
    decoder.idx = idx + 4;
    return as_type(decoder,
      decoder.dv.getUint32(idx)) } }

function _cbor_w8(as_type) {
  return function (decoder) {
    const idx = decoder.idx;
    decoder.idx = idx + 8;

    const v_hi = decoder.dv.getUint32(idx+0);
    const v_lo = decoder.dv.getUint32(idx+4);
    const u64 = v_lo + 0x100000000*v_hi;
    return as_type(decoder, u64) } }


// basic types

function as_pos_int(decoder, value) {
  return value}

function as_neg_int(decoder, value) {
  return -1 - value}

function as_bytes(decoder, len) {
  const {idx, u8} = decoder;
  decoder.idx = idx + len;
  return decoder.types.bytes(
    u8.subarray(idx, idx + len)) }

function as_utf8(decoder, len) {
  const {idx, u8} = decoder;
  decoder.idx = idx + len;
  return decoder.types.utf8(
    u8.subarray(idx, idx + len)) }

function as_list(decoder, len) {
  if (0 === len) {
    return decoder.types.empty_list()}

  const res = decoder.types.list(len);
  for (let i=0; i<len; i++) {
    res(false, i, decoder.nextValue()); }
  return res(true)}

function as_map(decoder, len) {
  if (0 === len) {
    return decoder.types.empty_map()}

  const res = decoder.types.map(len);
  for (let i=0; i<len; i++) {
    const key = decoder.nextValue();
    const value = decoder.nextValue();
    res(false, key, value); }
  return res(true)}


// streaming

function as_stream(decoder, accum) {
  let i = 0;
  while (true) {
    const value = decoder.nextValue();
    if (cbor_break_sym === value) {
      return accum(true) }
    accum(false, i++, value); } }

function as_pair_stream(decoder, accum) {
  while (true) {
    const key = decoder.nextValue();
    if (cbor_break_sym === key) {
      return accum(true) }
    accum(false, key, decoder.nextValue()); } }

function as_bytes_stream(decoder) {
  return as_stream(decoder, decoder.types.bytes_stream(decoder)) }

function as_utf8_stream(decoder) {
  return as_stream(decoder, decoder.types.utf8_stream(decoder)) }

function as_list_stream(decoder) {
  return as_stream(decoder, decoder.types.list_stream(decoder)) }

function as_map_stream(decoder) {
  return as_pair_stream(decoder, decoder.types.map_stream(decoder)) }


// primitives

function half_float(decoder) {
  const {idx, u8} = decoder;
  decoder.idx = idx + 2;
  return decoder.types.half_float(
    u8.subarray(idx, idx+2)) }

function single_float(decoder) {
  const {idx, dv} = decoder;
  decoder.idx = idx + 4;
  return dv.getFloat32(idx)}

function double_float(decoder) {
  const {idx, dv} = decoder;
  decoder.idx = idx + 8;
  return dv.getFloat64(idx)}


// simple values

function simple_repr(decoder, key) {
  return `simple(${key})`}

function bind_simple_dispatch(simple_lut) {
  if  ('function' !== typeof simple_lut.get) {
    throw new TypeError('Expected a simple_value Map') }

  return function(decoder, key) {
    return simple_lut.get(key)} }


// tag values

function bind_tag_dispatch(tags_lut) {
  if  ('function' !== typeof tags_lut.get) {
    throw new TypeError('Expected a tags Map') }

  return function(decoder, tag) {
    const tag_handler = tags_lut.get(tag);
    if (tag_handler) {
      const res = tag_handler(decoder, tag);
      const body = decoder.nextValue();
      return undefined === res ? body : res(body)}

    return {tag, body: decoder.nextValue()} } }


function basic_tags() {
  // from https://tools.ietf.org/html/rfc7049#section-2.4

  const tags_lut = new Map();

  // Standard date/time string; see Section 2.4.1
  tags_lut.set(0, () => ts_sz => new Date(ts_sz));
  // Epoch-based date/time; see Section 2.4.1
  tags_lut.set(1, () => seconds => new Date(seconds * 1000));

  // Positive bignum; see Section 2.4.2
  // tags_lut.set @ 2, () => v => v

  // Negative bignum; see Section 2.4.2
  // tags_lut.set @ 3, () => v => v

  // Decimal fraction; see Section 2.4.3
  // tags_lut.set @ 4, () => v => v

  // Bigfloat; see Section 2.4.3
  // tags_lut.set @ 5, () => v => v

  // Expected conversion to base64url encoding; see Section 2.4.4.2
  // tags_lut.set @ 21, () => v => v

  // Expected conversion to base64 encoding; see Section 2.4.4.2
  // tags_lut.set @ 22, () => v => v

  // Expected conversion to base16 encoding; see Section 2.4.4.2
  // tags_lut.set @ 23, () => v => v

  // Encoded CBOR data item; see Section 2.4.4.1
  tags_lut.set(24, decoder => u8 =>
    u8 instanceof Uint8Array ? decoder.withDecodeCBOR(u8) : u8);

  // URI; see Section 2.4.4.3
  tags_lut.set(32, () => url_sz => new URL(url_sz));

  // base64url; see Section 2.4.4.3
  //tags_lut.set @ 33, () => v => v

  // base64; see Section 2.4.4.3
  //tags_lut.set @ 34, () => v => v

  // Regular expression; see Section 2.4.4.3
  //tags_lut.set @ 35, () => v => v

  // MIME message; see Section 2.4.4.3
  //tags_lut.set @ 36, () => v => v

  // Self-describe CBOR; see Section 2.4.5
  tags_lut.set(55799, () => {} );


  // EXTENSIONS

  // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
  tags_lut.set(258, decoder => {decoder.pushTypes('Set');} );

  return tags_lut}


class CBORDecoderBasic {
  static create(u8) {return new this(u8)}
  static decode(u8) {return new this(u8).nextValue()}

  static withDecodeCBOR(u8) {
    u8.decodeCBOR =(()=>this.decode(u8));
    return u8}
  withDecodeCBOR(u8) {
    return this.constructor.withDecodeCBOR(u8)}

  static options(options) {
    if  (! options) {return this}

    class CBORDecoder_ extends this {}

    const jmp = decode_jump(options, this.jmp);
    CBORDecoder_.prototype.jmp = jmp;

    if (options.types) {
      const types = Object.create(this.prototype.types);
      CBORDecoder_.prototype.types = types;

      Object.assign(types, options.types);}

    return CBORDecoder_}

  constructor(u8) {
    u8 = as_u8_buffer(u8);

    Object.defineProperties(this,{
      u8:{value: u8}
    , dv:{value: new DataView(u8.buffer)} } );

    this.idx = 0;

    const stack = [];
    this.typestack = stack;
    this.types = this.types;

    const jmp = this.jmp;
    this.next =(()=> {
      const type_b = u8[ this.idx ++ ];
      if (undefined === type_b) {
        return {done: true} }

      if (0 !== stack.length) {
        this.types = stack.pop();}

      const decode = jmp[type_b] || this.decode_unknown;
      const value = decode(this, type_b);
      return {done: cbor_break_sym === value, value} } ); }

  [Symbol.iterator]() {return this}

  nextValue() {
    const {value, done} = this.next();
    if (done && cbor_break_sym !== value) {
      throw new Error('CBOR decode past the end of buffer') }
    return value}

  pushTypes(types) {
    if  ('string' === typeof types) {
      types = decode_types[types];}

    this.typestack.push(this.types, types);
    this.types = types;}

  decode_unknown(decoder, type_b) {
    throw new Error(`No CBOR decorder regeistered for ${type_b} (0x${('0'+type_b.toString(16)).slice(-2)})`) } }


CBORDecoderBasic.prototype.jmp = decode_basic_jump();
CBORDecoderBasic.prototype.types = decode_types;

const { assert } = require('chai');





describe('Decode CBOR Tags',(()=> {
  it('Tag 0 -- Standard date/time string; see Section 2.4.1',(()=> {
    const ans = CBORDecoderBasic.decode(hex_to_u8(
      'c0 74 323031332d30332d32315432303a30343a30305a') );

    assert.equal(ans.toISOString(), '2013-03-21T20:04:00.000Z'); } ) );

  it('Tag 1 -- Epoch-based date/time; see Section 2.4.1',(()=> {
    const ans = CBORDecoderBasic.decode(hex_to_u8(
      'c1 fb 41d452d9ec200000') );

    assert.equal(ans.toISOString(), '2013-03-21T20:04:00.500Z'); } ) );

  it('Tag 24 -- Encoded CBOR data item; see Section 2.4.4.1',(()=> {
    const u8 = CBORDecoderBasic.decode(hex_to_u8(
      'd818 456449455446') );

    assert.deepEqual(Array.from(u8), [ 100, 73, 69, 84, 70 ]);
    assert.equal(typeof u8.decodeCBOR, 'function');

    const ans = u8.decodeCBOR();
    assert.equal(ans, 'IETF'); } ) );

  it('Tag 32 -- URI; see Section 2.4.4.3',(()=> {
    const url = CBORDecoderBasic.decode(hex_to_u8(
      'd820 76687474703a2f2f7777772e6578616d706c652e636f6d') );

    assert.equal(url.href, 'http://www.example.com/');
    assert.equal(url.origin, 'http://www.example.com');
    assert.equal(url.protocol, 'http:');
    assert.equal(url.pathname, '/'); } ) );

  it('Tag 55799 -- Self-describe CBOR; see Section 2.4.5',(()=> {
    const ans = CBORDecoderBasic.decode(hex_to_u8(
      'D9 D9F7 83 01 02 03') );

    assert.deepEqual(ans, [1,2,3]); } ) );

  it('Tag 258 -- Sets for CBOR',(()=> {
    const s = CBORDecoderBasic.decode(hex_to_u8(
      'D9 0102 83 01 02 03') );

    assert.equal(s.has(1), true);
    assert.equal(s.has(2), true);
    assert.equal(s.has(3), true);

    assert.equal(s.size, 3);
    assert.equal(s instanceof Set, true); } ) ); } ) );

var test_vectors = [
  {
    cbor: "AA=="
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
    enabled: false
  , cbor: "wkkBAAAAAAAAAAA="
  , hex: "c249010000000000000000"
  , roundtrip: true
  , diagnostic: "2(h\'010000000000000000\')"
  , decoded: 18446744073709551616}

, {
    cbor: "O///////////"
  , hex: "3bffffffffffffffff"
  , roundtrip: true
  , decoded: -18446744073709551616}

, {
    enabled: false
  , cbor: "w0kBAAAAAAAAAAA="
  , hex: "c349010000000000000000"
  , roundtrip: true
  , diagnostic: "3(h\'010000000000000000\')"
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
  , decoded: []}

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
  , decoded: {1: 2, 3: 4}}

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

// algorithm: ftp://ftp.fox-toolkit.org/pub/fasthalffloatconversion.pdf

const buffer = new ArrayBuffer(4);
const floatView = new Float32Array(buffer);
const uint32View = new Uint32Array(buffer);


const baseTable = new Uint32Array(512);
const shiftTable = new Uint32Array(512);

for(let i = 0; i < 256; ++i) {
    const e = i - 127;

    // very small number (0, -0)
    if(e < -27) {
        baseTable[i | 0x000] = 0x0000;
        baseTable[i | 0x100] = 0x8000;
        shiftTable[i | 0x000] = 24;
        shiftTable[i | 0x100] = 24;

    // small number (denorm)
    } else if(e < -14) {
        baseTable[i | 0x000] =  0x0400 >> (-e - 14);
        baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
        shiftTable[i | 0x000] = -e - 1;
        shiftTable[i | 0x100] = -e - 1;

    // normal number
    } else if(e <= 15) {
        baseTable[i | 0x000] =  (e + 15) << 10;
        baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
        shiftTable[i | 0x000] = 13;
        shiftTable[i | 0x100] = 13;

    // large number (Infinity, -Infinity)
    } else if(e < 128) {
        baseTable[i | 0x000] = 0x7c00;
        baseTable[i | 0x100] = 0xfc00;
        shiftTable[i | 0x000] = 24;
        shiftTable[i | 0x100] = 24;

    // stay (NaN, Infinity, -Infinity)
    } else {
        baseTable[i | 0x000] = 0x7c00;
        baseTable[i | 0x100] = 0xfc00;
        shiftTable[i | 0x000] = 13;
        shiftTable[i | 0x100] = 13;
    }
}


const mantissaTable = new Uint32Array(2048);
const exponentTable = new Uint32Array(64);
const offsetTable = new Uint32Array(64);

mantissaTable[0] = 0;
for(let i = 1; i < 1024; ++i) {
    let m = i << 13;    // zero pad mantissa bits
    let e = 0;          // zero exponent

    // normalized
    while((m & 0x00800000) === 0) {
        e -= 0x00800000;    // decrement exponent
        m <<= 1;
    }

    m &= ~0x00800000;   // clear leading 1 bit
    e += 0x38800000;    // adjust bias

    mantissaTable[i] = m | e;
}
for(let i = 1024; i < 2048; ++i) {
    mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
}

exponentTable[0] = 0;
for(let i = 1; i < 31; ++i) {
    exponentTable[i] = i << 23;
}
exponentTable[31] = 0x47800000;
exponentTable[32] = 0x80000000;
for(let i = 33; i < 63; ++i) {
    exponentTable[i] = 0x80000000 + ((i - 32) << 23);
}
exponentTable[63] = 0xc7800000;

offsetTable[0] = 0;
for(let i = 1; i < 64; ++i) {
    if(i === 32) {
        offsetTable[i] = 0;
    } else {
        offsetTable[i] = 1024;
    }
}

/**
 * convert a half float number bits to a number.
 * @param {number} float16bits - half float number bits
 */
function convertToNumber(float16bits) {
    const m = float16bits >> 10;
    uint32View[0] = mantissaTable[offsetTable[m] + (float16bits & 0x3ff)] + exponentTable[m];
    return floatView[0];
}
function decode_half_float(u8) {
  return convertToNumber((u8[0]<<8) | u8[1]) }

const { assert: assert$1 } = require('chai');





function tag_as_diagnostic(decoder, tag) {
  return v => `${tag}(${JSON.stringify(v)})`}

function tag_as_hex_diagnostic(decoder, tag) {
  return v => `${tag}(${v})`}

const testing_tags = new Map();
testing_tags.set(0, tag_as_diagnostic );// Standard date/time string
testing_tags.set(1, tag_as_diagnostic );// Epoch-based date/time
testing_tags.set(2, tag_as_hex_diagnostic );// Positive bignum
testing_tags.set(3, tag_as_hex_diagnostic );// Negative bignum
testing_tags.set(23, tag_as_hex_diagnostic );// Expected conversion to base16 encoding
testing_tags.set(24, tag_as_hex_diagnostic );// Encoded CBOR data item
testing_tags.set(32, tag_as_diagnostic );// URI


const CBORDecoder$1 = CBORDecoderBasic.options({
  tags: testing_tags
, types:{
    half_float: decode_half_float
  , bytes(u8) {return `h'${u8_to_hex(u8)}'`}
  , bytes_stream(u8) {
      let res = [];
      return function (done, i, h_u8) {
        if (done) {return `(_ ${res.join(', ')})`}
        res.push(h_u8);} } } });

describe('Decode CBOR Test Vectors',(()=> {
  for (const test of test_vectors) {

    const it_fn = test.skip ? it.skip : test.only ? it.only : it;
    it_fn(`"${test.hex}" to ${test.diagnostic || JSON.stringify(test.decoded)}`,(()=> {
      const u8 = hex_to_u8(test.hex);

      const ans = CBORDecoder$1.decode(u8);
      if (test.diagnostic) {
        try {
          assert$1.equal(test.diagnostic, ans+''); }
        catch (err) {
          console.log(['diag', test.diagnostic, ans]);
          throw err} }
      else {
        try {
          assert$1.deepEqual(test.decoded, ans); }
        catch (err) {
          console.log(['decode', test.decoded, ans]);
          throw err} } } ) ); } } ) );
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX191bml0dGVzdC5janMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2pzLXU4LXV0aWxzL2VzbS9oZXguanMiLCIuLi9lc20vY2Jvcl9kZWNvZGUuanMiLCJ1bml0L3Rlc3RfZGVjb2RlX2Jhc2ljX3RhZ3MuanN5IiwidW5pdC9hcHBlbmRpeF9hLmpzeSIsIi4uL2VzbS9oYWxmX2Zsb2F0LmpzIiwidW5pdC90ZXN0X2RlY29kZV92ZWN0b3JzLmpzeSJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiB1OF90b19oZXgodTgsIHNlcCkge1xuICBpZiAodW5kZWZpbmVkID09PSB1OC5idWZmZXIpIHtcbiAgICB1OCA9IG5ldyBVaW50OEFycmF5KHU4KTt9XG5cbiAgcmV0dXJuIEFycmF5XG4gICAgLmZyb20odTgsIHYgPT4gdi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAuam9pbihudWxsICE9IHNlcCA/IHNlcCA6ICcnKSB9XG5cblxuZnVuY3Rpb24gaGV4X3RvX3U4KGhleCkge1xuICBoZXggPSBoZXgucmVwbGFjZSgvW14wLTlhLWZBLUZdL2csICcnKTtcbiAgY29uc3QgdTggPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoID4+IDEpO1xuICBmb3IgKGxldCBpPTAsIGkyPTA7IGk8dTgubGVuZ3RoOyBpKyssIGkyKz0yKSB7XG4gICAgdThbaV0gPSBwYXJzZUludChoZXguc2xpY2UoaTIsIGkyKzIpLCAxNik7IH1cbiAgcmV0dXJuIHU4fVxuXG5leHBvcnQgeyB1OF90b19oZXgsIGhleF90b191OCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGV4LmpzLm1hcFxuIiwiZnVuY3Rpb24gdThfdG9fdXRmOCh1OCkge1xuICByZXR1cm4gQnVmZmVyLmZyb20odTgpLnRvU3RyaW5nKCd1dGYtOCcpfVxuXG5jb25zdCB7IHJhbmRvbUJ5dGVzLCByYW5kb21GaWxsU3luYyB9ID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5cbmZ1bmN0aW9uIGFzX3U4X2J1ZmZlcih1OCkge1xuICBpZiAodTggaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgcmV0dXJuIHU4fVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHU4KSkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheSh1OC5idWZmZXIpfVxuICBpZiAodTggaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheSh1OCl9XG4gIHJldHVybiBVaW50OEFycmF5LmZyb20odTgpfVxuXG5mdW5jdGlvbiB1OF9jb25jYXQocGFydHMpIHtcbiAgbGV0IGk9MCwgbGVuPTA7XG4gIGZvciAoY29uc3QgYiBvZiBwYXJ0cykge1xuICAgIGNvbnN0IGJ5dGVMZW5ndGggPSBiLmJ5dGVMZW5ndGg7XG4gICAgaWYgICgnbnVtYmVyJyAhPT0gdHlwZW9mIGJ5dGVMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFydCBieXRlTGVuZ3RoXCIpIH1cbiAgICBsZW4gKz0gYnl0ZUxlbmd0aDt9XG5cbiAgY29uc3QgdTggPSBuZXcgVWludDhBcnJheShsZW4pO1xuICBmb3IgKGNvbnN0IHU4X3BhcnQgb2YgcGFydHMpIHtcbiAgICB1OC5zZXQodThfcGFydCwgaSk7XG4gICAgaSArPSB1OF9wYXJ0LmJ5dGVMZW5ndGg7fVxuICByZXR1cm4gdTh9XG5cbmNvbnN0IGRlY29kZV90eXBlcyA9e1xuICBfX3Byb3RvX186IG51bGxcblxuLCBoYWxmX2Zsb2F0KHU4KSB7cmV0dXJuIHU4fVxuXG4sIGJ5dGVzKHU4KSB7cmV0dXJuIHU4fVxuLCBieXRlc19zdHJlYW0oZGVjb2Rlcikge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGksIHU4KSB7XG4gICAgICBpZiAoZG9uZSkge1xuICAgICAgICBjb25zdCBhbnMgPSB1OF9jb25jYXQocmVzKTtcbiAgICAgICAgcmVzID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGFuc31cblxuICAgICAgcmVzLnB1c2godTgpO30gfVxuXG4sIHV0ZjgodTgpIHtyZXR1cm4gdThfdG9fdXRmOCh1OCl9XG4sIHV0Zjhfc3RyZWFtKGRlY29kZXIpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCBzdHIpIHtcbiAgICAgIGlmIChkb25lKSB7XG4gICAgICAgIGNvbnN0IGFucyA9IHJlcy5qb2luKCcnKTtcbiAgICAgICAgcmVzID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGFuc31cblxuICAgICAgcmVzLnB1c2goc3RyKTt9IH1cblxuXG4sIGVtcHR5X2xpc3QoKSB7cmV0dXJuIFtdfVxuXG4sIGxpc3QoZGVjb2RlciwgbGVuKSB7XG4gICAgbGV0IHJlcyA9IDAgPT09IGxlbiA/IFtdIDogbmV3IEFycmF5KGxlbik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCB2KSB7XG4gICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICByZXNbaV0gPSB2O30gfVxuXG4sIGxpc3Rfc3RyZWFtKGRlY29kZXIpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCB2KSB7XG4gICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICByZXMucHVzaCh2KTt9IH1cblxuXG4sIGVtcHR5X21hcCgpIHtyZXR1cm4ge319XG5cbiwgbWFwKGRlY29kZXIpIHtcbiAgICBsZXQgcmVzID0ge307XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBrLCB2KSB7XG4gICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICByZXNba10gPSB2O30gfVxuXG4sIG1hcF9zdHJlYW0oZGVjb2Rlcikge1xuICAgIGxldCByZXMgPSB7fTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGssIHYpIHtcbiAgICAgIGlmIChkb25lKSB7cmV0dXJuIHJlc31cbiAgICAgIHJlc1trXSA9IHY7fSB9XG5cblxuLCBNYXA6e1xuICAgIF9fcHJvdG9fXzogbnVsbFxuXG4gICwgZW1wdHlfbWFwKCkge3JldHVybiBuZXcgTWFwKCl9XG5cbiAgLCBtYXAoZGVjb2Rlcikge1xuICAgICAgbGV0IHJlcyA9IG5ldyBNYXAoKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZG9uZSwgaywgdikge1xuICAgICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICAgIHJlcy5zZXQoaywgdik7fSB9XG5cbiAgLCBtYXBfc3RyZWFtKGRlY29kZXIpIHtcbiAgICAgIGxldCByZXMgPSBuZXcgTWFwKCk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGssIHYpIHtcbiAgICAgICAgaWYgKGRvbmUpIHtyZXR1cm4gcmVzfVxuICAgICAgICByZXMuc2V0KGssIHYpO30gfSB9XG5cblxuLCBTZXQ6e1xuICAgIF9fcHJvdG9fXzogbnVsbFxuXG4gICwgZW1wdHlfbGlzdCgpIHtyZXR1cm4gbmV3IFNldCgpfVxuXG4gICwgbGlzdChkZWNvZGVyKSB7XG4gICAgICBsZXQgcmVzID0gbmV3IFNldCgpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCB2KSB7XG4gICAgICAgIGlmIChkb25lKSB7cmV0dXJuIHJlc31cbiAgICAgICAgcmVzLmFkZCh2KTt9IH1cblxuICAsIGxpc3Rfc3RyZWFtKGRlY29kZXIpIHtcbiAgICAgIGxldCByZXMgPSBuZXcgU2V0KCk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGksIHYpIHtcbiAgICAgICAgaWYgKGRvbmUpIHtyZXR1cm4gcmVzfVxuICAgICAgICByZXMuYWRkKHYpO30gfSB9IH07XG5cbmNvbnN0IHtVUkx9ID0gcmVxdWlyZSgndXJsJyk7XG5mdW5jdGlvbiBkZWNvZGVfanVtcChvcHRpb25zLCBqbXApIHtcbiAgam1wID0gam1wID8gam1wLnNsaWNlKCkgOiBkZWNvZGVfYmFzaWNfanVtcCgpO1xuXG4gIGlmIChudWxsID09IG9wdGlvbnMpIHtvcHRpb25zID0ge307fVxuXG4gIGlmIChvcHRpb25zLnNpbXBsZSkge1xuICAgIGNvbnN0IHNpbXBsZV92YWx1ZSA9IGJpbmRfc2ltcGxlX2Rpc3BhdGNoKG9wdGlvbnMuc2ltcGxlKTtcbiAgICBjb25zdCB0aW55X3NpbXBsZSA9IF9jYm9yX3Rpbnkoc2ltcGxlX3ZhbHVlKTtcblxuICAgIGZvciAobGV0IGk9MHhlMDsgaTw9IDB4ZjM7IGkrKykge1xuICAgICAgam1wW2ldID0gdGlueV9zaW1wbGU7fVxuXG4gICAgam1wWzB4ZjhdID0gX2Nib3JfdzEoc2ltcGxlX3ZhbHVlKTsgfVxuXG5cbiAgaWYgKG9wdGlvbnMudGFncykge1xuICAgIGNvbnN0IGFzX3RhZyA9IGJpbmRfdGFnX2Rpc3BhdGNoKG9wdGlvbnMudGFncyk7XG4gICAgY29uc3QgdGlueV90YWcgPSBfY2Jvcl90aW55KGFzX3RhZyk7XG5cbiAgICBmb3IgKGxldCBpPTB4YzA7IGk8PSAweGQ3OyBpKyspIHtcbiAgICAgIGptcFsweGMwIHwgaV0gPSB0aW55X3RhZzt9XG5cbiAgICBqbXBbMHhkOF0gPSBfY2Jvcl93MShhc190YWcpO1xuICAgIGptcFsweGQ5XSA9IF9jYm9yX3cyKGFzX3RhZyk7XG4gICAgam1wWzB4ZGFdID0gX2Nib3JfdzQoYXNfdGFnKTtcbiAgICBqbXBbMHhkYl0gPSBfY2Jvcl93OChhc190YWcpOyB9XG5cbiAgcmV0dXJuIGptcH1cblxuXG5mdW5jdGlvbiBkZWNvZGVfYmFzaWNfanVtcCgpIHtcbiAgY29uc3QgYXNfdGFnID0gYmluZF90YWdfZGlzcGF0Y2goYmFzaWNfdGFncygpKTtcblxuICBjb25zdCB0aW55X3Bvc19pbnQgPSBfY2Jvcl90aW55KGFzX3Bvc19pbnQpO1xuICBjb25zdCB0aW55X25lZ19pbnQgPSBfY2Jvcl90aW55KGFzX25lZ19pbnQpO1xuICBjb25zdCB0aW55X2J5dGVzID0gX2Nib3JfdGlueShhc19ieXRlcyk7XG4gIGNvbnN0IHRpbnlfdXRmOCA9IF9jYm9yX3RpbnkoYXNfdXRmOCk7XG4gIGNvbnN0IHRpbnlfbGlzdCA9IF9jYm9yX3RpbnkoYXNfbGlzdCk7XG4gIGNvbnN0IHRpbnlfbWFwID0gX2Nib3JfdGlueShhc19tYXApO1xuICBjb25zdCB0aW55X3RhZyA9IF9jYm9yX3RpbnkoYXNfdGFnKTtcbiAgY29uc3QgdGlueV9zaW1wbGVfcmVwciA9IF9jYm9yX3Rpbnkoc2ltcGxlX3JlcHIpO1xuXG4gIGNvbnN0IGptcCA9IG5ldyBBcnJheSgyNTYpO1xuXG4gIGZvciAobGV0IGk9MDsgaTw9IDIzOyBpKyspIHtcbiAgICBqbXBbMHgwMCB8IGldID0gdGlueV9wb3NfaW50O1xuICAgIGptcFsweDIwIHwgaV0gPSB0aW55X25lZ19pbnQ7XG4gICAgam1wWzB4NDAgfCBpXSA9IHRpbnlfYnl0ZXM7XG4gICAgam1wWzB4NjAgfCBpXSA9IHRpbnlfdXRmODtcbiAgICBqbXBbMHg4MCB8IGldID0gdGlueV9saXN0O1xuICAgIGptcFsweGEwIHwgaV0gPSB0aW55X21hcDtcbiAgICBqbXBbMHhjMCB8IGldID0gdGlueV90YWc7XG4gICAgam1wWzB4ZTAgfCBpXSA9IHRpbnlfc2ltcGxlX3JlcHI7fVxuXG4gIGNvbnN0IGNib3Jfd2lkdGhzID1bX2Nib3JfdzEsIF9jYm9yX3cyLCBfY2Jvcl93NCwgX2Nib3JfdzhdO1xuICBmb3IgKGxldCB3PTA7IHc8IDQ7IHcrKykge1xuICAgIGNvbnN0IGkgPSAyNCt3LCB3aWR0aCA9IGNib3Jfd2lkdGhzW3ddO1xuICAgIGptcFsweDAwIHwgaV0gPSB3aWR0aChhc19wb3NfaW50KTtcbiAgICBqbXBbMHgyMCB8IGldID0gd2lkdGgoYXNfbmVnX2ludCk7XG4gICAgam1wWzB4NDAgfCBpXSA9IHdpZHRoKGFzX2J5dGVzKTtcbiAgICBqbXBbMHg2MCB8IGldID0gd2lkdGgoYXNfdXRmOCk7XG4gICAgam1wWzB4ODAgfCBpXSA9IHdpZHRoKGFzX2xpc3QpO1xuICAgIGptcFsweGEwIHwgaV0gPSB3aWR0aChhc19tYXApO1xuICAgIGptcFsweGMwIHwgaV0gPSB3aWR0aChhc190YWcpOyB9XG5cbiAgLy8gc3RyZWFtaW5nIGRhdGEgdHlwZXNcbiAgam1wWzB4NWZdID0gYXNfYnl0ZXNfc3RyZWFtO1xuICBqbXBbMHg3Zl0gPSBhc191dGY4X3N0cmVhbTtcbiAgam1wWzB4OWZdID0gYXNfbGlzdF9zdHJlYW07XG4gIGptcFsweGJmXSA9IGFzX21hcF9zdHJlYW07XG5cbiAgLy8gc2VtYW50aWMgdGFnXG5cbiAgLy8gcHJpbWl0aXZlc1xuICBqbXBbMHhmNF0gPSBmdW5jdGlvbigpIHtyZXR1cm4gZmFsc2V9O1xuICBqbXBbMHhmNV0gPSBmdW5jdGlvbigpIHtyZXR1cm4gdHJ1ZX07XG4gIGptcFsweGY2XSA9IGZ1bmN0aW9uKCkge3JldHVybiBudWxsfTtcbiAgam1wWzB4ZjddID0gZnVuY3Rpb24oKSB7fTsvLyB1bmRlZmluZWRcbiAgam1wWzB4ZjhdID0gX2Nib3JfdzEoc2ltcGxlX3JlcHIpO1xuICBqbXBbMHhmOV0gPSBoYWxmX2Zsb2F0O1xuICBqbXBbMHhmYV0gPSBzaW5nbGVfZmxvYXQ7XG4gIGptcFsweGZiXSA9IGRvdWJsZV9mbG9hdDtcbiAgLy9qbXBbMHhmY10gPSB1bmRlZmluZWRcbiAgLy9qbXBbMHhmZF0gPSB1bmRlZmluZWRcbiAgLy9qbXBbMHhmZV0gPSB1bmRlZmluZWRcbiAgam1wWzB4ZmZdID0gZnVuY3Rpb24gKCkge3JldHVybiBjYm9yX2JyZWFrX3N5bX07XG5cbiAgcmV0dXJuIGptcH1cblxuXG4vLyBzcGVjaWFsIHRva2VuXG5jb25zdCBjYm9yX2JyZWFrX3N5bSA9IFN5bWJvbCgnY2Jvcl9icmVhaycpO1xuXG4vLyBjYm9yIHNpemUvdmFsdWUgaW50ZXJwcmV0ZXJzXG5mdW5jdGlvbiBfY2Jvcl90aW55KGFzX3R5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkZWNvZGVyLCB0eXBlX2IpIHtcbiAgICByZXR1cm4gYXNfdHlwZShkZWNvZGVyLCB0eXBlX2IgJiAweDFmKX0gfVxuXG5mdW5jdGlvbiBfY2Jvcl93MShhc190eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGVjb2Rlcikge1xuICAgIGNvbnN0IGlkeCA9IGRlY29kZXIuaWR4O1xuICAgIGRlY29kZXIuaWR4ID0gaWR4ICsgMTtcbiAgICByZXR1cm4gYXNfdHlwZShkZWNvZGVyLFxuICAgICAgZGVjb2Rlci5kdi5nZXRVaW50OChpZHgpKSB9IH1cblxuZnVuY3Rpb24gX2Nib3JfdzIoYXNfdHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGRlY29kZXIpIHtcbiAgICBjb25zdCBpZHggPSBkZWNvZGVyLmlkeDtcbiAgICBkZWNvZGVyLmlkeCA9IGlkeCArIDI7XG4gICAgcmV0dXJuIGFzX3R5cGUoZGVjb2RlcixcbiAgICAgIGRlY29kZXIuZHYuZ2V0VWludDE2KGlkeCkpIH0gfVxuXG5mdW5jdGlvbiBfY2Jvcl93NChhc190eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGVjb2Rlcikge1xuICAgIGNvbnN0IGlkeCA9IGRlY29kZXIuaWR4O1xuICAgIGRlY29kZXIuaWR4ID0gaWR4ICsgNDtcbiAgICByZXR1cm4gYXNfdHlwZShkZWNvZGVyLFxuICAgICAgZGVjb2Rlci5kdi5nZXRVaW50MzIoaWR4KSkgfSB9XG5cbmZ1bmN0aW9uIF9jYm9yX3c4KGFzX3R5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgY29uc3QgaWR4ID0gZGVjb2Rlci5pZHg7XG4gICAgZGVjb2Rlci5pZHggPSBpZHggKyA4O1xuXG4gICAgY29uc3Qgdl9oaSA9IGRlY29kZXIuZHYuZ2V0VWludDMyKGlkeCswKTtcbiAgICBjb25zdCB2X2xvID0gZGVjb2Rlci5kdi5nZXRVaW50MzIoaWR4KzQpO1xuICAgIGNvbnN0IHU2NCA9IHZfbG8gKyAweDEwMDAwMDAwMCp2X2hpO1xuICAgIHJldHVybiBhc190eXBlKGRlY29kZXIsIHU2NCkgfSB9XG5cblxuLy8gYmFzaWMgdHlwZXNcblxuZnVuY3Rpb24gYXNfcG9zX2ludChkZWNvZGVyLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWV9XG5cbmZ1bmN0aW9uIGFzX25lZ19pbnQoZGVjb2RlciwgdmFsdWUpIHtcbiAgcmV0dXJuIC0xIC0gdmFsdWV9XG5cbmZ1bmN0aW9uIGFzX2J5dGVzKGRlY29kZXIsIGxlbikge1xuICBjb25zdCB7aWR4LCB1OH0gPSBkZWNvZGVyO1xuICBkZWNvZGVyLmlkeCA9IGlkeCArIGxlbjtcbiAgcmV0dXJuIGRlY29kZXIudHlwZXMuYnl0ZXMoXG4gICAgdTguc3ViYXJyYXkoaWR4LCBpZHggKyBsZW4pKSB9XG5cbmZ1bmN0aW9uIGFzX3V0ZjgoZGVjb2RlciwgbGVuKSB7XG4gIGNvbnN0IHtpZHgsIHU4fSA9IGRlY29kZXI7XG4gIGRlY29kZXIuaWR4ID0gaWR4ICsgbGVuO1xuICByZXR1cm4gZGVjb2Rlci50eXBlcy51dGY4KFxuICAgIHU4LnN1YmFycmF5KGlkeCwgaWR4ICsgbGVuKSkgfVxuXG5mdW5jdGlvbiBhc19saXN0KGRlY29kZXIsIGxlbikge1xuICBpZiAoMCA9PT0gbGVuKSB7XG4gICAgcmV0dXJuIGRlY29kZXIudHlwZXMuZW1wdHlfbGlzdCgpfVxuXG4gIGNvbnN0IHJlcyA9IGRlY29kZXIudHlwZXMubGlzdChsZW4pO1xuICBmb3IgKGxldCBpPTA7IGk8bGVuOyBpKyspIHtcbiAgICByZXMoZmFsc2UsIGksIGRlY29kZXIubmV4dFZhbHVlKCkpOyB9XG4gIHJldHVybiByZXModHJ1ZSl9XG5cbmZ1bmN0aW9uIGFzX21hcChkZWNvZGVyLCBsZW4pIHtcbiAgaWYgKDAgPT09IGxlbikge1xuICAgIHJldHVybiBkZWNvZGVyLnR5cGVzLmVtcHR5X21hcCgpfVxuXG4gIGNvbnN0IHJlcyA9IGRlY29kZXIudHlwZXMubWFwKGxlbik7XG4gIGZvciAobGV0IGk9MDsgaTxsZW47IGkrKykge1xuICAgIGNvbnN0IGtleSA9IGRlY29kZXIubmV4dFZhbHVlKCk7XG4gICAgY29uc3QgdmFsdWUgPSBkZWNvZGVyLm5leHRWYWx1ZSgpO1xuICAgIHJlcyhmYWxzZSwga2V5LCB2YWx1ZSk7IH1cbiAgcmV0dXJuIHJlcyh0cnVlKX1cblxuXG4vLyBzdHJlYW1pbmdcblxuZnVuY3Rpb24gYXNfc3RyZWFtKGRlY29kZXIsIGFjY3VtKSB7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGRlY29kZXIubmV4dFZhbHVlKCk7XG4gICAgaWYgKGNib3JfYnJlYWtfc3ltID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFjY3VtKHRydWUpIH1cbiAgICBhY2N1bShmYWxzZSwgaSsrLCB2YWx1ZSk7IH0gfVxuXG5mdW5jdGlvbiBhc19wYWlyX3N0cmVhbShkZWNvZGVyLCBhY2N1bSkge1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IGtleSA9IGRlY29kZXIubmV4dFZhbHVlKCk7XG4gICAgaWYgKGNib3JfYnJlYWtfc3ltID09PSBrZXkpIHtcbiAgICAgIHJldHVybiBhY2N1bSh0cnVlKSB9XG4gICAgYWNjdW0oZmFsc2UsIGtleSwgZGVjb2Rlci5uZXh0VmFsdWUoKSk7IH0gfVxuXG5mdW5jdGlvbiBhc19ieXRlc19zdHJlYW0oZGVjb2Rlcikge1xuICByZXR1cm4gYXNfc3RyZWFtKGRlY29kZXIsIGRlY29kZXIudHlwZXMuYnl0ZXNfc3RyZWFtKGRlY29kZXIpKSB9XG5cbmZ1bmN0aW9uIGFzX3V0Zjhfc3RyZWFtKGRlY29kZXIpIHtcbiAgcmV0dXJuIGFzX3N0cmVhbShkZWNvZGVyLCBkZWNvZGVyLnR5cGVzLnV0Zjhfc3RyZWFtKGRlY29kZXIpKSB9XG5cbmZ1bmN0aW9uIGFzX2xpc3Rfc3RyZWFtKGRlY29kZXIpIHtcbiAgcmV0dXJuIGFzX3N0cmVhbShkZWNvZGVyLCBkZWNvZGVyLnR5cGVzLmxpc3Rfc3RyZWFtKGRlY29kZXIpKSB9XG5cbmZ1bmN0aW9uIGFzX21hcF9zdHJlYW0oZGVjb2Rlcikge1xuICByZXR1cm4gYXNfcGFpcl9zdHJlYW0oZGVjb2RlciwgZGVjb2Rlci50eXBlcy5tYXBfc3RyZWFtKGRlY29kZXIpKSB9XG5cblxuLy8gcHJpbWl0aXZlc1xuXG5mdW5jdGlvbiBoYWxmX2Zsb2F0KGRlY29kZXIpIHtcbiAgY29uc3Qge2lkeCwgdTh9ID0gZGVjb2RlcjtcbiAgZGVjb2Rlci5pZHggPSBpZHggKyAyO1xuICByZXR1cm4gZGVjb2Rlci50eXBlcy5oYWxmX2Zsb2F0KFxuICAgIHU4LnN1YmFycmF5KGlkeCwgaWR4KzIpKSB9XG5cbmZ1bmN0aW9uIHNpbmdsZV9mbG9hdChkZWNvZGVyKSB7XG4gIGNvbnN0IHtpZHgsIGR2fSA9IGRlY29kZXI7XG4gIGRlY29kZXIuaWR4ID0gaWR4ICsgNDtcbiAgcmV0dXJuIGR2LmdldEZsb2F0MzIoaWR4KX1cblxuZnVuY3Rpb24gZG91YmxlX2Zsb2F0KGRlY29kZXIpIHtcbiAgY29uc3Qge2lkeCwgZHZ9ID0gZGVjb2RlcjtcbiAgZGVjb2Rlci5pZHggPSBpZHggKyA4O1xuICByZXR1cm4gZHYuZ2V0RmxvYXQ2NChpZHgpfVxuXG5cbi8vIHNpbXBsZSB2YWx1ZXNcblxuZnVuY3Rpb24gc2ltcGxlX3JlcHIoZGVjb2Rlciwga2V5KSB7XG4gIHJldHVybiBgc2ltcGxlKCR7a2V5fSlgfVxuXG5mdW5jdGlvbiBiaW5kX3NpbXBsZV9kaXNwYXRjaChzaW1wbGVfbHV0KSB7XG4gIGlmICAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHNpbXBsZV9sdXQuZ2V0KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzaW1wbGVfdmFsdWUgTWFwJykgfVxuXG4gIHJldHVybiBmdW5jdGlvbihkZWNvZGVyLCBrZXkpIHtcbiAgICByZXR1cm4gc2ltcGxlX2x1dC5nZXQoa2V5KX0gfVxuXG5cbi8vIHRhZyB2YWx1ZXNcblxuZnVuY3Rpb24gYmluZF90YWdfZGlzcGF0Y2godGFnc19sdXQpIHtcbiAgaWYgICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgdGFnc19sdXQuZ2V0KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSB0YWdzIE1hcCcpIH1cblxuICByZXR1cm4gZnVuY3Rpb24oZGVjb2RlciwgdGFnKSB7XG4gICAgY29uc3QgdGFnX2hhbmRsZXIgPSB0YWdzX2x1dC5nZXQodGFnKTtcbiAgICBpZiAodGFnX2hhbmRsZXIpIHtcbiAgICAgIGNvbnN0IHJlcyA9IHRhZ19oYW5kbGVyKGRlY29kZXIsIHRhZyk7XG4gICAgICBjb25zdCBib2R5ID0gZGVjb2Rlci5uZXh0VmFsdWUoKTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQgPT09IHJlcyA/IGJvZHkgOiByZXMoYm9keSl9XG5cbiAgICByZXR1cm4ge3RhZywgYm9keTogZGVjb2Rlci5uZXh0VmFsdWUoKX0gfSB9XG5cblxuZnVuY3Rpb24gYmFzaWNfdGFncygpIHtcbiAgLy8gZnJvbSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzA0OSNzZWN0aW9uLTIuNFxuXG4gIGNvbnN0IHRhZ3NfbHV0ID0gbmV3IE1hcCgpO1xuXG4gIC8vIFN0YW5kYXJkIGRhdGUvdGltZSBzdHJpbmc7IHNlZSBTZWN0aW9uIDIuNC4xXG4gIHRhZ3NfbHV0LnNldCgwLCAoKSA9PiB0c19zeiA9PiBuZXcgRGF0ZSh0c19zeikpO1xuICAvLyBFcG9jaC1iYXNlZCBkYXRlL3RpbWU7IHNlZSBTZWN0aW9uIDIuNC4xXG4gIHRhZ3NfbHV0LnNldCgxLCAoKSA9PiBzZWNvbmRzID0+IG5ldyBEYXRlKHNlY29uZHMgKiAxMDAwKSk7XG5cbiAgLy8gUG9zaXRpdmUgYmlnbnVtOyBzZWUgU2VjdGlvbiAyLjQuMlxuICAvLyB0YWdzX2x1dC5zZXQgQCAyLCAoKSA9PiB2ID0+IHZcblxuICAvLyBOZWdhdGl2ZSBiaWdudW07IHNlZSBTZWN0aW9uIDIuNC4yXG4gIC8vIHRhZ3NfbHV0LnNldCBAIDMsICgpID0+IHYgPT4gdlxuXG4gIC8vIERlY2ltYWwgZnJhY3Rpb247IHNlZSBTZWN0aW9uIDIuNC4zXG4gIC8vIHRhZ3NfbHV0LnNldCBAIDQsICgpID0+IHYgPT4gdlxuXG4gIC8vIEJpZ2Zsb2F0OyBzZWUgU2VjdGlvbiAyLjQuM1xuICAvLyB0YWdzX2x1dC5zZXQgQCA1LCAoKSA9PiB2ID0+IHZcblxuICAvLyBFeHBlY3RlZCBjb252ZXJzaW9uIHRvIGJhc2U2NHVybCBlbmNvZGluZzsgc2VlIFNlY3Rpb24gMi40LjQuMlxuICAvLyB0YWdzX2x1dC5zZXQgQCAyMSwgKCkgPT4gdiA9PiB2XG5cbiAgLy8gRXhwZWN0ZWQgY29udmVyc2lvbiB0byBiYXNlNjQgZW5jb2Rpbmc7IHNlZSBTZWN0aW9uIDIuNC40LjJcbiAgLy8gdGFnc19sdXQuc2V0IEAgMjIsICgpID0+IHYgPT4gdlxuXG4gIC8vIEV4cGVjdGVkIGNvbnZlcnNpb24gdG8gYmFzZTE2IGVuY29kaW5nOyBzZWUgU2VjdGlvbiAyLjQuNC4yXG4gIC8vIHRhZ3NfbHV0LnNldCBAIDIzLCAoKSA9PiB2ID0+IHZcblxuICAvLyBFbmNvZGVkIENCT1IgZGF0YSBpdGVtOyBzZWUgU2VjdGlvbiAyLjQuNC4xXG4gIHRhZ3NfbHV0LnNldCgyNCwgZGVjb2RlciA9PiB1OCA9PlxuICAgIHU4IGluc3RhbmNlb2YgVWludDhBcnJheSA/IGRlY29kZXIud2l0aERlY29kZUNCT1IodTgpIDogdTgpO1xuXG4gIC8vIFVSSTsgc2VlIFNlY3Rpb24gMi40LjQuM1xuICB0YWdzX2x1dC5zZXQoMzIsICgpID0+IHVybF9zeiA9PiBuZXcgVVJMKHVybF9zeikpO1xuXG4gIC8vIGJhc2U2NHVybDsgc2VlIFNlY3Rpb24gMi40LjQuM1xuICAvL3RhZ3NfbHV0LnNldCBAIDMzLCAoKSA9PiB2ID0+IHZcblxuICAvLyBiYXNlNjQ7IHNlZSBTZWN0aW9uIDIuNC40LjNcbiAgLy90YWdzX2x1dC5zZXQgQCAzNCwgKCkgPT4gdiA9PiB2XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9uOyBzZWUgU2VjdGlvbiAyLjQuNC4zXG4gIC8vdGFnc19sdXQuc2V0IEAgMzUsICgpID0+IHYgPT4gdlxuXG4gIC8vIE1JTUUgbWVzc2FnZTsgc2VlIFNlY3Rpb24gMi40LjQuM1xuICAvL3RhZ3NfbHV0LnNldCBAIDM2LCAoKSA9PiB2ID0+IHZcblxuICAvLyBTZWxmLWRlc2NyaWJlIENCT1I7IHNlZSBTZWN0aW9uIDIuNC41XG4gIHRhZ3NfbHV0LnNldCg1NTc5OSwgKCkgPT4ge30gKTtcblxuXG4gIC8vIEVYVEVOU0lPTlNcblxuICAvLyBDQk9SIFNldHMgaHR0cHM6Ly9naXRodWIuY29tL2lucHV0LW91dHB1dC1oay9jYm9yLXNldHMtc3BlYy9ibG9iL21hc3Rlci9DQk9SX1NFVFMubWRcbiAgdGFnc19sdXQuc2V0KDI1OCwgZGVjb2RlciA9PiB7ZGVjb2Rlci5wdXNoVHlwZXMoJ1NldCcpO30gKTtcblxuICByZXR1cm4gdGFnc19sdXR9XG5cbmZ1bmN0aW9uIGNib3JfdThfZGVjb2RlKHU4LCBvcHRpb25zKSB7XG4gIHJldHVybiBDQk9SRGVjb2Rlci5kZWNvZGUodTgpfVxuXG5cbmNsYXNzIENCT1JEZWNvZGVyQmFzaWMge1xuICBzdGF0aWMgY3JlYXRlKHU4KSB7cmV0dXJuIG5ldyB0aGlzKHU4KX1cbiAgc3RhdGljIGRlY29kZSh1OCkge3JldHVybiBuZXcgdGhpcyh1OCkubmV4dFZhbHVlKCl9XG5cbiAgc3RhdGljIHdpdGhEZWNvZGVDQk9SKHU4KSB7XG4gICAgdTguZGVjb2RlQ0JPUiA9KCgpPT50aGlzLmRlY29kZSh1OCkpO1xuICAgIHJldHVybiB1OH1cbiAgd2l0aERlY29kZUNCT1IodTgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci53aXRoRGVjb2RlQ0JPUih1OCl9XG5cbiAgc3RhdGljIG9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmICAoISBvcHRpb25zKSB7cmV0dXJuIHRoaXN9XG5cbiAgICBjbGFzcyBDQk9SRGVjb2Rlcl8gZXh0ZW5kcyB0aGlzIHt9XG5cbiAgICBjb25zdCBqbXAgPSBkZWNvZGVfanVtcChvcHRpb25zLCB0aGlzLmptcCk7XG4gICAgQ0JPUkRlY29kZXJfLnByb3RvdHlwZS5qbXAgPSBqbXA7XG5cbiAgICBpZiAob3B0aW9ucy50eXBlcykge1xuICAgICAgY29uc3QgdHlwZXMgPSBPYmplY3QuY3JlYXRlKHRoaXMucHJvdG90eXBlLnR5cGVzKTtcbiAgICAgIENCT1JEZWNvZGVyXy5wcm90b3R5cGUudHlwZXMgPSB0eXBlcztcblxuICAgICAgT2JqZWN0LmFzc2lnbih0eXBlcywgb3B0aW9ucy50eXBlcyk7fVxuXG4gICAgcmV0dXJuIENCT1JEZWNvZGVyX31cblxuICBjb25zdHJ1Y3Rvcih1OCkge1xuICAgIHU4ID0gYXNfdThfYnVmZmVyKHU4KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMse1xuICAgICAgdTg6e3ZhbHVlOiB1OH1cbiAgICAsIGR2Ont2YWx1ZTogbmV3IERhdGFWaWV3KHU4LmJ1ZmZlcil9IH0gKTtcblxuICAgIHRoaXMuaWR4ID0gMDtcblxuICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgdGhpcy50eXBlc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLnR5cGVzID0gdGhpcy50eXBlcztcblxuICAgIGNvbnN0IGptcCA9IHRoaXMuam1wO1xuICAgIHRoaXMubmV4dCA9KCgpPT4ge1xuICAgICAgY29uc3QgdHlwZV9iID0gdThbIHRoaXMuaWR4ICsrIF07XG4gICAgICBpZiAodW5kZWZpbmVkID09PSB0eXBlX2IpIHtcbiAgICAgICAgcmV0dXJuIHtkb25lOiB0cnVlfSB9XG5cbiAgICAgIGlmICgwICE9PSBzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy50eXBlcyA9IHN0YWNrLnBvcCgpO31cblxuICAgICAgY29uc3QgZGVjb2RlID0gam1wW3R5cGVfYl0gfHwgdGhpcy5kZWNvZGVfdW5rbm93bjtcbiAgICAgIGNvbnN0IHZhbHVlID0gZGVjb2RlKHRoaXMsIHR5cGVfYik7XG4gICAgICByZXR1cm4ge2RvbmU6IGNib3JfYnJlYWtfc3ltID09PSB2YWx1ZSwgdmFsdWV9IH0gKTsgfVxuXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkge3JldHVybiB0aGlzfVxuXG4gIG5leHRWYWx1ZSgpIHtcbiAgICBjb25zdCB7dmFsdWUsIGRvbmV9ID0gdGhpcy5uZXh0KCk7XG4gICAgaWYgKGRvbmUgJiYgY2Jvcl9icmVha19zeW0gIT09IHZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NCT1IgZGVjb2RlIHBhc3QgdGhlIGVuZCBvZiBidWZmZXInKSB9XG4gICAgcmV0dXJuIHZhbHVlfVxuXG4gIHB1c2hUeXBlcyh0eXBlcykge1xuICAgIGlmICAoJ3N0cmluZycgPT09IHR5cGVvZiB0eXBlcykge1xuICAgICAgdHlwZXMgPSBkZWNvZGVfdHlwZXNbdHlwZXNdO31cblxuICAgIHRoaXMudHlwZXN0YWNrLnB1c2godGhpcy50eXBlcywgdHlwZXMpO1xuICAgIHRoaXMudHlwZXMgPSB0eXBlczt9XG5cbiAgZGVjb2RlX3Vua25vd24oZGVjb2RlciwgdHlwZV9iKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBObyBDQk9SIGRlY29yZGVyIHJlZ2Vpc3RlcmVkIGZvciAke3R5cGVfYn0gKDB4JHsoJzAnK3R5cGVfYi50b1N0cmluZygxNikpLnNsaWNlKC0yKX0pYCkgfSB9XG5cblxuQ0JPUkRlY29kZXJCYXNpYy5wcm90b3R5cGUuam1wID0gZGVjb2RlX2Jhc2ljX2p1bXAoKTtcbkNCT1JEZWNvZGVyQmFzaWMucHJvdG90eXBlLnR5cGVzID0gZGVjb2RlX3R5cGVzO1xuXG5jb25zdCBDQk9SRGVjb2RlciA9IENCT1JEZWNvZGVyQmFzaWM7XG5cbmV4cG9ydCBkZWZhdWx0IGNib3JfdThfZGVjb2RlO1xuZXhwb3J0IHsgY2Jvcl91OF9kZWNvZGUsIENCT1JEZWNvZGVyQmFzaWMsIENCT1JEZWNvZGVyLCBkZWNvZGVfdHlwZXMsIGRlY29kZV9qdW1wLCBkZWNvZGVfYmFzaWNfanVtcCwgY2Jvcl9icmVha19zeW0gfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNib3JfZGVjb2RlLmpzLm1hcFxuIiwiY29uc3QgeyBhc3NlcnQgfSA9IHJlcXVpcmUoJ2NoYWknKVxuXG5pbXBvcnQgeyBoZXhfdG9fdTggfSBmcm9tICd1OC11dGlscy9lc20vaGV4J1xuI0lGIFBMQVRfTk9ERUpTXG4gIGltcG9ydCB7IENCT1JEZWNvZGVyQmFzaWMgfSBmcm9tICdjYm9yLWNvZGVjL2VzbS9jYm9yX2RlY29kZS5qcydcblxuI0VMSUYgUExBVF9XRUJcbiAgaW1wb3J0IHsgQ0JPUkRlY29kZXJCYXNpYyB9IGZyb20gJ2Nib3ItY29kZWMvZXNtL3dlYi9jYm9yX2RlY29kZS5qcydcblxuXG5kZXNjcmliZSBAICdEZWNvZGUgQ0JPUiBUYWdzJywgQD0+IDo6XG4gIGl0IEAgJ1RhZyAwIC0tIFN0YW5kYXJkIGRhdGUvdGltZSBzdHJpbmc7IHNlZSBTZWN0aW9uIDIuNC4xJywgQD0+IDo6XG4gICAgY29uc3QgYW5zID0gQ0JPUkRlY29kZXJCYXNpYy5kZWNvZGUgQCBoZXhfdG9fdTggQFxuICAgICAgJ2MwIDc0IDMyMzAzMTMzMmQzMDMzMmQzMjMxNTQzMjMwM2EzMDM0M2EzMDMwNWEnXG5cbiAgICBhc3NlcnQuZXF1YWwgQCBhbnMudG9JU09TdHJpbmcoKSwgJzIwMTMtMDMtMjFUMjA6MDQ6MDAuMDAwWidcblxuICBpdCBAICdUYWcgMSAtLSBFcG9jaC1iYXNlZCBkYXRlL3RpbWU7IHNlZSBTZWN0aW9uIDIuNC4xJywgQD0+IDo6XG4gICAgY29uc3QgYW5zID0gQ0JPUkRlY29kZXJCYXNpYy5kZWNvZGUgQCBoZXhfdG9fdTggQFxuICAgICAgJ2MxIGZiIDQxZDQ1MmQ5ZWMyMDAwMDAnXG5cbiAgICBhc3NlcnQuZXF1YWwgQCBhbnMudG9JU09TdHJpbmcoKSwgJzIwMTMtMDMtMjFUMjA6MDQ6MDAuNTAwWidcblxuICBpdCBAICdUYWcgMjQgLS0gRW5jb2RlZCBDQk9SIGRhdGEgaXRlbTsgc2VlIFNlY3Rpb24gMi40LjQuMScsIEA9PiA6OlxuICAgIGNvbnN0IHU4ID0gQ0JPUkRlY29kZXJCYXNpYy5kZWNvZGUgQCBoZXhfdG9fdTggQFxuICAgICAgJ2Q4MTggNDU2NDQ5NDU1NDQ2J1xuXG4gICAgYXNzZXJ0LmRlZXBFcXVhbCBAIEFycmF5LmZyb20odTgpLCBbIDEwMCwgNzMsIDY5LCA4NCwgNzAgXVxuICAgIGFzc2VydC5lcXVhbCBAIHR5cGVvZiB1OC5kZWNvZGVDQk9SLCAnZnVuY3Rpb24nXG5cbiAgICBjb25zdCBhbnMgPSB1OC5kZWNvZGVDQk9SKClcbiAgICBhc3NlcnQuZXF1YWwgQCBhbnMsICdJRVRGJ1xuXG4gIGl0IEAgJ1RhZyAzMiAtLSBVUkk7IHNlZSBTZWN0aW9uIDIuNC40LjMnLCBAPT4gOjpcbiAgICBjb25zdCB1cmwgPSBDQk9SRGVjb2RlckJhc2ljLmRlY29kZSBAIGhleF90b191OCBAXG4gICAgICAnZDgyMCA3NjY4NzQ3NDcwM2EyZjJmNzc3Nzc3MmU2NTc4NjE2ZDcwNmM2NTJlNjM2ZjZkJ1xuXG4gICAgYXNzZXJ0LmVxdWFsIEAgdXJsLmhyZWYsICdodHRwOi8vd3d3LmV4YW1wbGUuY29tLydcbiAgICBhc3NlcnQuZXF1YWwgQCB1cmwub3JpZ2luLCAnaHR0cDovL3d3dy5leGFtcGxlLmNvbSdcbiAgICBhc3NlcnQuZXF1YWwgQCB1cmwucHJvdG9jb2wsICdodHRwOidcbiAgICBhc3NlcnQuZXF1YWwgQCB1cmwucGF0aG5hbWUsICcvJ1xuXG4gIGl0IEAgJ1RhZyA1NTc5OSAtLSBTZWxmLWRlc2NyaWJlIENCT1I7IHNlZSBTZWN0aW9uIDIuNC41JywgQD0+IDo6XG4gICAgY29uc3QgYW5zID0gQ0JPUkRlY29kZXJCYXNpYy5kZWNvZGUgQCBoZXhfdG9fdTggQFxuICAgICAgJ0Q5IEQ5RjcgODMgMDEgMDIgMDMnXG5cbiAgICBhc3NlcnQuZGVlcEVxdWFsIEAgYW5zLCBbMSwyLDNdXG5cbiAgaXQgQCAnVGFnIDI1OCAtLSBTZXRzIGZvciBDQk9SJywgQD0+IDo6XG4gICAgY29uc3QgcyA9IENCT1JEZWNvZGVyQmFzaWMuZGVjb2RlIEAgaGV4X3RvX3U4IEBcbiAgICAgICdEOSAwMTAyIDgzIDAxIDAyIDAzJ1xuXG4gICAgYXNzZXJ0LmVxdWFsIEAgcy5oYXMoMSksIHRydWVcbiAgICBhc3NlcnQuZXF1YWwgQCBzLmhhcygyKSwgdHJ1ZVxuICAgIGFzc2VydC5lcXVhbCBAIHMuaGFzKDMpLCB0cnVlXG5cbiAgICBhc3NlcnQuZXF1YWwgQCBzLnNpemUsIDNcbiAgICBhc3NlcnQuZXF1YWwgQCBzIGluc3RhbmNlb2YgU2V0LCB0cnVlXG5cbiIsImV4cG9ydCBkZWZhdWx0IEBbXVxuICBAe31cbiAgICBjYm9yOiBcIkFBPT1cIlxuICAgIGhleDogXCIwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiQVE9PVwiXG4gICAgaGV4OiBcIjAxXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxXG5cbiAgQHt9XG4gICAgY2JvcjogXCJDZz09XCJcbiAgICBoZXg6IFwiMGFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJGdz09XCJcbiAgICBoZXg6IFwiMTdcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDIzXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHQmc9XCJcbiAgICBoZXg6IFwiMTgxOFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMjRcblxuICBAe31cbiAgICBjYm9yOiBcIkdCaz1cIlxuICAgIGhleDogXCIxODE5XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAyNVxuXG4gIEB7fVxuICAgIGNib3I6IFwiR0dRPVwiXG4gICAgaGV4OiBcIjE4NjRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiR1FQb1wiXG4gICAgaGV4OiBcIjE5MDNlOFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiR2dBUFFrQT1cIlxuICAgIGhleDogXCIxYTAwMGY0MjQwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxMDAwMDAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHd0FBQU9qVXBSQUFcIlxuICAgIGhleDogXCIxYjAwMDAwMGU4ZDRhNTEwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMDAwMDAwMDAwMDBcblxuICBAe31cbiAgICBjYm9yOiBcIkcvLy8vLy8vLy8vL1wiXG4gICAgaGV4OiBcIjFiZmZmZmZmZmZmZmZmZmZmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTg0NDY3NDQwNzM3MDk1NTE2MTVcblxuICBAe31cbiAgICBlbmFibGVkOiBmYWxzZVxuICAgIGNib3I6IFwid2trQkFBQUFBQUFBQUFBPVwiXG4gICAgaGV4OiBcImMyNDkwMTAwMDAwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMihoXFwnMDEwMDAwMDAwMDAwMDAwMDAwXFwnKVwiXG4gICAgZGVjb2RlZDogMTg0NDY3NDQwNzM3MDk1NTE2MTZcblxuICBAe31cbiAgICBjYm9yOiBcIk8vLy8vLy8vLy8vL1wiXG4gICAgaGV4OiBcIjNiZmZmZmZmZmZmZmZmZmZmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTE4NDQ2NzQ0MDczNzA5NTUxNjE2XG5cbiAgQHt9XG4gICAgZW5hYmxlZDogZmFsc2VcbiAgICBjYm9yOiBcIncwa0JBQUFBQUFBQUFBQT1cIlxuICAgIGhleDogXCJjMzQ5MDEwMDAwMDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjMoaFxcJzAxMDAwMDAwMDAwMDAwMDAwMFxcJylcIlxuICAgIGRlY29kZWQ6IC0xODQ0Njc0NDA3MzcwOTU1MTYxN1xuXG4gIEB7fVxuICAgIGNib3I6IFwiSUE9PVwiXG4gICAgaGV4OiBcIjIwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMVxuXG4gIEB7fVxuICAgIGNib3I6IFwiS1E9PVwiXG4gICAgaGV4OiBcIjI5XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTBcblxuICBAe31cbiAgICBjYm9yOiBcIk9HTT1cIlxuICAgIGhleDogXCIzODYzXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJPUVBuXCJcbiAgICBoZXg6IFwiMzkwM2U3XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTAwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1FBQVwiXG4gICAgaGV4OiBcImY5MDAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrWUFBXCJcbiAgICBoZXg6IFwiZjk4MDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMC4wXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrVHdBXCJcbiAgICBoZXg6IFwiZjkzYzAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjBcblxuICBAe31cbiAgICBjYm9yOiBcIit6L3htWm1abVptYVwiXG4gICAgaGV4OiBcImZiM2ZmMTk5OTk5OTk5OTk5YVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMS4xXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrVDRBXCJcbiAgICBoZXg6IFwiZjkzZTAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjVcblxuICBAe31cbiAgICBjYm9yOiBcIitYdi9cIlxuICAgIGhleDogXCJmOTdiZmZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDY1NTA0LjBcblxuICBAe31cbiAgICBjYm9yOiBcIitrZkRVQUE9XCJcbiAgICBoZXg6IFwiZmE0N2MzNTAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwMDAwLjBcblxuICBAe31cbiAgICBjYm9yOiBcIituOS8vLzg9XCJcbiAgICBoZXg6IFwiZmE3ZjdmZmZmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMy40MDI4MjM0NjYzODUyODg2ZSszOFxuXG4gIEB7fVxuICAgIGNib3I6IFwiKzM0MzVEeUlBSFdjXCJcbiAgICBoZXg6IFwiZmI3ZTM3ZTQzYzg4MDA3NTljXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjBlKzMwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1FBQlwiXG4gICAgaGV4OiBcImY5MDAwMVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogNS45NjA0NjQ0Nzc1MzkwNjNlLTA4XG5cbiAgQHt9XG4gICAgY2JvcjogXCIrUVFBXCJcbiAgICBoZXg6IFwiZjkwNDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiA2LjEwMzUxNTYyNWUtMDVcblxuICBAe31cbiAgICBjYm9yOiBcIitjUUFcIlxuICAgIGhleDogXCJmOWM0MDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC00LjBcblxuICBAe31cbiAgICBjYm9yOiBcIis4QVFabVptWm1abVwiXG4gICAgaGV4OiBcImZiYzAxMDY2NjY2NjY2NjY2NlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTQuMVxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1h3QVwiXG4gICAgaGV4OiBcImY5N2MwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJJbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrWDRBXCJcbiAgICBoZXg6IFwiZjk3ZTAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIk5hTlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrZndBXCJcbiAgICBoZXg6IFwiZjlmYzAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIi1JbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrbitBQUFBPVwiXG4gICAgaGV4OiBcImZhN2Y4MDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIkluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIituL0FBQUE9XCJcbiAgICBoZXg6IFwiZmE3ZmMwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiTmFOXCJcblxuICBAe31cbiAgICBjYm9yOiBcIit2K0FBQUE9XCJcbiAgICBoZXg6IFwiZmFmZjgwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiLUluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIiszL3dBQUFBQUFBQVwiXG4gICAgaGV4OiBcImZiN2ZmMDAwMDAwMDAwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiKzMvNEFBQUFBQUFBXCJcbiAgICBoZXg6IFwiZmI3ZmY4MDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCJOYU5cIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiKy8vd0FBQUFBQUFBXCJcbiAgICBoZXg6IFwiZmJmZmYwMDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCItSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiOUE9PVwiXG4gICAgaGV4OiBcImY0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBmYWxzZVxuXG4gIEB7fVxuICAgIGNib3I6IFwiOVE9PVwiXG4gICAgaGV4OiBcImY1XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiB0cnVlXG5cbiAgQHt9XG4gICAgY2JvcjogXCI5Zz09XCJcbiAgICBoZXg6IFwiZjZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IG51bGxcblxuICBAe31cbiAgICBjYm9yOiBcIjl3PT1cIlxuICAgIGhleDogXCJmN1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJ1bmRlZmluZWRcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiOEE9PVwiXG4gICAgaGV4OiBcImYwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcInNpbXBsZSgxNilcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK0JnPVwiXG4gICAgaGV4OiBcImY4MThcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwic2ltcGxlKDI0KVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrUDg9XCJcbiAgICBoZXg6IFwiZjhmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJzaW1wbGUoMjU1KVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ3SFF5TURFekxUQXpMVEl4VkRJd09qQTBPakF3V2c9PVwiXG4gICAgaGV4OiBcImMwNzQzMjMwMzEzMzJkMzAzMzJkMzIzMTU0MzIzMDNhMzAzNDNhMzAzMDVhXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjAoXFxcIjIwMTMtMDMtMjFUMjA6MDQ6MDBaXFxcIilcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwid1JwUlMyZXdcIlxuICAgIGhleDogXCJjMTFhNTE0YjY3YjBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMSgxMzYzODk2MjQwKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ3ZnRCMUZMWjdDQUFBQT09XCJcbiAgICBoZXg6IFwiYzFmYjQxZDQ1MmQ5ZWMyMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMSgxMzYzODk2MjQwLjUpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIjEwUUJBZ01FXCJcbiAgICBoZXg6IFwiZDc0NDAxMDIwMzA0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjIzKGgnMDEwMjAzMDQnKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIyQmhGWkVsRlZFWT1cIlxuICAgIGhleDogXCJkODE4NDU2NDQ5NDU1NDQ2XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjI0KGgnNjQ0OTQ1NTQ0NicpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIjJDQjJhSFIwY0RvdkwzZDNkeTVsZUdGdGNHeGxMbU52YlE9PVwiXG4gICAgaGV4OiBcImQ4MjA3NjY4NzQ3NDcwM2EyZjJmNzc3Nzc3MmU2NTc4NjE2ZDcwNmM2NTJlNjM2ZjZkXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIjMyKFxcXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tXFxcIilcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiUUE9PVwiXG4gICAgaGV4OiBcIjQwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcImgnJ1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJSQUVDQXdRPVwiXG4gICAgaGV4OiBcIjQ0MDEwMjAzMDRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiaCcwMTAyMDMwNCdcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWUE9PVwiXG4gICAgaGV4OiBcIjYwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZV0U9XCJcbiAgICBoZXg6IFwiNjE2MVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCJhXCJcblxuICBAe31cbiAgICBjYm9yOiBcIlpFbEZWRVk9XCJcbiAgICBoZXg6IFwiNjQ0OTQ1NTQ0NlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCJJRVRGXCJcblxuICBAe31cbiAgICBjYm9yOiBcIllpSmNcIlxuICAgIGhleDogXCI2MjIyNWNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwiXFxcIlxcXFxcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWXNPOFwiXG4gICAgaGV4OiBcIjYyYzNiY1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCLDvFwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZK2F3dEE9PVwiXG4gICAgaGV4OiBcIjYzZTZiMGI0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIuawtFwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJaUENRaFpFPVwiXG4gICAgaGV4OiBcIjY0ZjA5MDg1OTFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwi8JCFkVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnQT09XCJcbiAgICBoZXg6IFwiODBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFtdXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0VDQXc9PVwiXG4gICAgaGV4OiBcIjgzMDEwMjAzXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW10gMSwgMiwgM1xuXG4gIEB7fVxuICAgIGNib3I6IFwiZ3dHQ0FnT0NCQVU9XCJcbiAgICBoZXg6IFwiODMwMTgyMDIwMzgyMDQwNVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcIm1Ca0JBZ01FQlFZSENBa0tDd3dORGc4UUVSSVRGQlVXRnhnWUdCaz1cIlxuICAgIGhleDogXCI5ODE5MDEwMjAzMDQwNTA2MDcwODA5MGEwYjBjMGQwZTBmMTAxMTEyMTMxNDE1MTYxNzE4MTgxODE5XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LFxuICAgICAgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNVxuXG4gIEB7fVxuICAgIGNib3I6IFwib0E9PVwiXG4gICAgaGV4OiBcImEwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAe31cblxuXG4gIEB7fVxuICAgIGNib3I6IFwib2dFQ0F3UT1cIlxuICAgIGhleDogXCJhMjAxMDIwMzA0XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiB7MTogMiwgMzogNH1cblxuICBAe31cbiAgICBjYm9yOiBcIm9tRmhBV0ZpZ2dJRFwiXG4gICAgaGV4OiBcImEyNjE2MTAxNjE2MjgyMDIwM1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogQHt9XG4gICAgICBcImFcIjogMVxuICAgICAgXCJiXCI6IEBbXVxuICAgICAgICAyXG4gICAgICAgIDNcblxuICBAe31cbiAgICBjYm9yOiBcImdtRmhvV0ZpWVdNPVwiXG4gICAgaGV4OiBcIjgyNjE2MWExNjE2MjYxNjNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgXCJhXCJcbiAgICAgIEB7fSBcImJcIjogXCJjXCJcblxuICBAe31cbiAgICBjYm9yOiBcInBXRmhZVUZoWW1GQ1lXTmhRMkZrWVVSaFpXRkZcIlxuICAgIGhleDogXCJhNTYxNjE2MTQxNjE2MjYxNDI2MTYzNjE0MzYxNjQ2MTQ0NjE2NTYxNDVcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEB7fVxuICAgICAgXCJhXCI6IFwiQVwiXG4gICAgICBcImJcIjogXCJCXCJcbiAgICAgIFwiY1wiOiBcIkNcIlxuICAgICAgXCJkXCI6IFwiRFwiXG4gICAgICBcImVcIjogXCJFXCJcblxuXG4gIEB7fVxuICAgIGNib3I6IFwiWDBJQkFrTURCQVgvXCJcbiAgICBoZXg6IFwiNWY0MjAxMDI0MzAzMDQwNWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCIoXyBoJzAxMDInLCBoJzAzMDQwNScpXCJcblxuICBAe31cbiAgICBjYm9yOiBcImYyVnpkSEpsWVdSdGFXNW4vdz09XCJcbiAgICBoZXg6IFwiN2Y2NTczNzQ3MjY1NjE2NDZkNjk2ZTY3ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBcInN0cmVhbWluZ1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJuLzg9XCJcbiAgICBoZXg6IFwiOWZmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IFtdXG5cbiAgQHt9XG4gICAgY2JvcjogXCJud0dDQWdPZkJBWC8vdz09XCJcbiAgICBoZXg6IFwiOWYwMTgyMDIwMzlmMDQwNWZmZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwibndHQ0FnT0NCQVgvXCJcbiAgICBoZXg6IFwiOWYwMTgyMDIwMzgyMDQwNWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcImd3R0NBZ09mQkFYL1wiXG4gICAgaGV4OiBcIjgzMDE4MjAyMDM5ZjA0MDVmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMVxuICAgICAgQFtdIDIsIDNcbiAgICAgIEBbXSA0LCA1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0dmQWdQL2dnUUZcIlxuICAgIGhleDogXCI4MzAxOWYwMjAzZmY4MjA0MDVcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwibndFQ0F3UUZCZ2NJQ1FvTERBME9EeEFSRWhNVUZSWVhHQmdZR2Y4PVwiXG4gICAgaGV4OiBcIjlmMDEwMjAzMDQwNTA2MDcwODA5MGEwYjBjMGQwZTBmMTAxMTEyMTMxNDE1MTYxNzE4MTgxODE5ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2XG4gICAgICAxNywgMTgsIDE5LCAyMCwgMjEsIDIyLCAyMywgMjQsIDI1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJ2MkZoQVdGaW53SUQvLzg9XCJcbiAgICBoZXg6IFwiYmY2MTYxMDE2MTYyOWYwMjAzZmZmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEB7fVxuICAgICAgXCJhXCI6IDFcbiAgICAgIFwiYlwiOiBAW10gMiwgM1xuXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnbUZodjJGaVlXUC9cIlxuICAgIGhleDogXCI4MjYxNjFiZjYxNjI2MTYzZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIFwiYVwiXG4gICAgICBAe30gXCJiXCI6IFwiY1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ2Mk5HZFc3MVkwRnRkQ0gvXCJcbiAgICBoZXg6IFwiYmY2MzQ2NzU2ZWY1NjM0MTZkNzQyMWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQHt9XG4gICAgICBcIkZ1blwiOiB0cnVlXG4gICAgICBcIkFtdFwiOiAtMlxuIiwiLy8gYWxnb3JpdGhtOiBmdHA6Ly9mdHAuZm94LXRvb2xraXQub3JnL3B1Yi9mYXN0aGFsZmZsb2F0Y29udmVyc2lvbi5wZGZcblxuY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKDQpO1xuY29uc3QgZmxvYXRWaWV3ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIpO1xuY29uc3QgdWludDMyVmlldyA9IG5ldyBVaW50MzJBcnJheShidWZmZXIpO1xuXG5cbmNvbnN0IGJhc2VUYWJsZSA9IG5ldyBVaW50MzJBcnJheSg1MTIpO1xuY29uc3Qgc2hpZnRUYWJsZSA9IG5ldyBVaW50MzJBcnJheSg1MTIpO1xuXG5mb3IobGV0IGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICBjb25zdCBlID0gaSAtIDEyNztcblxuICAgIC8vIHZlcnkgc21hbGwgbnVtYmVyICgwLCAtMClcbiAgICBpZihlIDwgLTI3KSB7XG4gICAgICAgIGJhc2VUYWJsZVtpIHwgMHgwMDBdID0gMHgwMDAwO1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MTAwXSA9IDB4ODAwMDtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgwMDBdID0gMjQ7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MTAwXSA9IDI0O1xuXG4gICAgLy8gc21hbGwgbnVtYmVyIChkZW5vcm0pXG4gICAgfSBlbHNlIGlmKGUgPCAtMTQpIHtcbiAgICAgICAgYmFzZVRhYmxlW2kgfCAweDAwMF0gPSAgMHgwNDAwID4+ICgtZSAtIDE0KTtcbiAgICAgICAgYmFzZVRhYmxlW2kgfCAweDEwMF0gPSAoMHgwNDAwID4+ICgtZSAtIDE0KSkgfCAweDgwMDA7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MDAwXSA9IC1lIC0gMTtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgxMDBdID0gLWUgLSAxO1xuXG4gICAgLy8gbm9ybWFsIG51bWJlclxuICAgIH0gZWxzZSBpZihlIDw9IDE1KSB7XG4gICAgICAgIGJhc2VUYWJsZVtpIHwgMHgwMDBdID0gIChlICsgMTUpIDw8IDEwO1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MTAwXSA9ICgoZSArIDE1KSA8PCAxMCkgfCAweDgwMDA7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MDAwXSA9IDEzO1xuICAgICAgICBzaGlmdFRhYmxlW2kgfCAweDEwMF0gPSAxMztcblxuICAgIC8vIGxhcmdlIG51bWJlciAoSW5maW5pdHksIC1JbmZpbml0eSlcbiAgICB9IGVsc2UgaWYoZSA8IDEyOCkge1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MDAwXSA9IDB4N2MwMDtcbiAgICAgICAgYmFzZVRhYmxlW2kgfCAweDEwMF0gPSAweGZjMDA7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MDAwXSA9IDI0O1xuICAgICAgICBzaGlmdFRhYmxlW2kgfCAweDEwMF0gPSAyNDtcblxuICAgIC8vIHN0YXkgKE5hTiwgSW5maW5pdHksIC1JbmZpbml0eSlcbiAgICB9IGVsc2Uge1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MDAwXSA9IDB4N2MwMDtcbiAgICAgICAgYmFzZVRhYmxlW2kgfCAweDEwMF0gPSAweGZjMDA7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MDAwXSA9IDEzO1xuICAgICAgICBzaGlmdFRhYmxlW2kgfCAweDEwMF0gPSAxMztcbiAgICB9XG59XG5cbi8qKlxuICogcm91bmQgYSBudW1iZXIgdG8gYSBoYWxmIGZsb2F0IG51bWJlciBiaXRzLlxuICogQHBhcmFtIHtudW1iZXJ9IG51bVxuICovXG5mdW5jdGlvbiByb3VuZFRvRmxvYXQxNkJpdHMobnVtKSB7XG4gICAgZmxvYXRWaWV3WzBdID0gbnVtO1xuXG4gICAgY29uc3QgZiA9IHVpbnQzMlZpZXdbMF07XG4gICAgY29uc3QgZSA9IChmID4+IDIzKSAmIDB4MWZmO1xuICAgIHJldHVybiBiYXNlVGFibGVbZV0gKyAoKGYgJiAweDAwN2ZmZmZmKSA+PiBzaGlmdFRhYmxlW2VdKTtcbn1cblxuXG5jb25zdCBtYW50aXNzYVRhYmxlID0gbmV3IFVpbnQzMkFycmF5KDIwNDgpO1xuY29uc3QgZXhwb25lbnRUYWJsZSA9IG5ldyBVaW50MzJBcnJheSg2NCk7XG5jb25zdCBvZmZzZXRUYWJsZSA9IG5ldyBVaW50MzJBcnJheSg2NCk7XG5cbm1hbnRpc3NhVGFibGVbMF0gPSAwO1xuZm9yKGxldCBpID0gMTsgaSA8IDEwMjQ7ICsraSkge1xuICAgIGxldCBtID0gaSA8PCAxMzsgICAgLy8gemVybyBwYWQgbWFudGlzc2EgYml0c1xuICAgIGxldCBlID0gMDsgICAgICAgICAgLy8gemVybyBleHBvbmVudFxuXG4gICAgLy8gbm9ybWFsaXplZFxuICAgIHdoaWxlKChtICYgMHgwMDgwMDAwMCkgPT09IDApIHtcbiAgICAgICAgZSAtPSAweDAwODAwMDAwOyAgICAvLyBkZWNyZW1lbnQgZXhwb25lbnRcbiAgICAgICAgbSA8PD0gMTtcbiAgICB9XG5cbiAgICBtICY9IH4weDAwODAwMDAwOyAgIC8vIGNsZWFyIGxlYWRpbmcgMSBiaXRcbiAgICBlICs9IDB4Mzg4MDAwMDA7ICAgIC8vIGFkanVzdCBiaWFzXG5cbiAgICBtYW50aXNzYVRhYmxlW2ldID0gbSB8IGU7XG59XG5mb3IobGV0IGkgPSAxMDI0OyBpIDwgMjA0ODsgKytpKSB7XG4gICAgbWFudGlzc2FUYWJsZVtpXSA9IDB4MzgwMDAwMDAgKyAoKGkgLSAxMDI0KSA8PCAxMyk7XG59XG5cbmV4cG9uZW50VGFibGVbMF0gPSAwO1xuZm9yKGxldCBpID0gMTsgaSA8IDMxOyArK2kpIHtcbiAgICBleHBvbmVudFRhYmxlW2ldID0gaSA8PCAyMztcbn1cbmV4cG9uZW50VGFibGVbMzFdID0gMHg0NzgwMDAwMDtcbmV4cG9uZW50VGFibGVbMzJdID0gMHg4MDAwMDAwMDtcbmZvcihsZXQgaSA9IDMzOyBpIDwgNjM7ICsraSkge1xuICAgIGV4cG9uZW50VGFibGVbaV0gPSAweDgwMDAwMDAwICsgKChpIC0gMzIpIDw8IDIzKTtcbn1cbmV4cG9uZW50VGFibGVbNjNdID0gMHhjNzgwMDAwMDtcblxub2Zmc2V0VGFibGVbMF0gPSAwO1xuZm9yKGxldCBpID0gMTsgaSA8IDY0OyArK2kpIHtcbiAgICBpZihpID09PSAzMikge1xuICAgICAgICBvZmZzZXRUYWJsZVtpXSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2Zmc2V0VGFibGVbaV0gPSAxMDI0O1xuICAgIH1cbn1cblxuLyoqXG4gKiBjb252ZXJ0IGEgaGFsZiBmbG9hdCBudW1iZXIgYml0cyB0byBhIG51bWJlci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBmbG9hdDE2Yml0cyAtIGhhbGYgZmxvYXQgbnVtYmVyIGJpdHNcbiAqL1xuZnVuY3Rpb24gY29udmVydFRvTnVtYmVyKGZsb2F0MTZiaXRzKSB7XG4gICAgY29uc3QgbSA9IGZsb2F0MTZiaXRzID4+IDEwO1xuICAgIHVpbnQzMlZpZXdbMF0gPSBtYW50aXNzYVRhYmxlW29mZnNldFRhYmxlW21dICsgKGZsb2F0MTZiaXRzICYgMHgzZmYpXSArIGV4cG9uZW50VGFibGVbbV07XG4gICAgcmV0dXJuIGZsb2F0Vmlld1swXTtcbn1cblxuY29uc3QgaGFsZl9mbG9hdCA9IGRlY29kZV9oYWxmX2Zsb2F0O1xuZnVuY3Rpb24gZGVjb2RlX2hhbGZfZmxvYXQodTgpIHtcbiAgcmV0dXJuIGNvbnZlcnRUb051bWJlcigodThbMF08PDgpIHwgdThbMV0pIH1cblxuZnVuY3Rpb24gZW5jb2RlX2hhbGZfZmxvYXQodmFsdWUpIHtcbiAgY29uc3QgdTE2ID0gcm91bmRUb0Zsb2F0MTZCaXRzKHZhbHVlKTtcbiAgcmV0dXJuIHUxNn1cblxuZXhwb3J0IGRlZmF1bHQgZGVjb2RlX2hhbGZfZmxvYXQ7XG5leHBvcnQgeyBoYWxmX2Zsb2F0LCBkZWNvZGVfaGFsZl9mbG9hdCwgZW5jb2RlX2hhbGZfZmxvYXQgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhbGZfZmxvYXQuanMubWFwXG4iLCJjb25zdCB7IGFzc2VydCB9ID0gcmVxdWlyZSgnY2hhaScpXG5pbXBvcnQgdGVzdF92ZWN0b3JzIGZyb20gJy4vYXBwZW5kaXhfYS5qc3knXG5cbmltcG9ydCB7IGhleF90b191OCwgdThfdG9faGV4IH0gZnJvbSAndTgtdXRpbHMvZXNtL2hleCdcbmltcG9ydCBoYWxmX2Zsb2F0IGZyb20gJ2Nib3ItY29kZWMvZXNtL2hhbGZfZmxvYXQuanMnXG5cbiNJRiBQTEFUX05PREVKU1xuICBpbXBvcnQgeyBDQk9SRGVjb2RlckJhc2ljIH0gZnJvbSAnY2Jvci1jb2RlYy9lc20vY2Jvcl9kZWNvZGUuanMnXG5cbiNFTElGIFBMQVRfV0VCXG4gIGltcG9ydCB7IENCT1JEZWNvZGVyQmFzaWMgfSBmcm9tICdjYm9yLWNvZGVjL2VzbS93ZWIvY2Jvcl9kZWNvZGUuanMnXG5cblxuZnVuY3Rpb24gdGFnX2FzX2RpYWdub3N0aWMoZGVjb2RlciwgdGFnKSA6OlxuICByZXR1cm4gdiA9PiBgJHt0YWd9KCR7SlNPTi5zdHJpbmdpZnkodil9KWBcblxuZnVuY3Rpb24gdGFnX2FzX2hleF9kaWFnbm9zdGljKGRlY29kZXIsIHRhZykgOjpcbiAgcmV0dXJuIHYgPT4gYCR7dGFnfSgke3Z9KWBcblxuY29uc3QgdGVzdGluZ190YWdzID0gbmV3IE1hcCgpXG50ZXN0aW5nX3RhZ3Muc2V0IEAgMCwgdGFnX2FzX2RpYWdub3N0aWMgLy8gU3RhbmRhcmQgZGF0ZS90aW1lIHN0cmluZ1xudGVzdGluZ190YWdzLnNldCBAIDEsIHRhZ19hc19kaWFnbm9zdGljIC8vIEVwb2NoLWJhc2VkIGRhdGUvdGltZVxudGVzdGluZ190YWdzLnNldCBAIDIsIHRhZ19hc19oZXhfZGlhZ25vc3RpYyAvLyBQb3NpdGl2ZSBiaWdudW1cbnRlc3RpbmdfdGFncy5zZXQgQCAzLCB0YWdfYXNfaGV4X2RpYWdub3N0aWMgLy8gTmVnYXRpdmUgYmlnbnVtXG50ZXN0aW5nX3RhZ3Muc2V0IEAgMjMsIHRhZ19hc19oZXhfZGlhZ25vc3RpYyAvLyBFeHBlY3RlZCBjb252ZXJzaW9uIHRvIGJhc2UxNiBlbmNvZGluZ1xudGVzdGluZ190YWdzLnNldCBAIDI0LCB0YWdfYXNfaGV4X2RpYWdub3N0aWMgLy8gRW5jb2RlZCBDQk9SIGRhdGEgaXRlbVxudGVzdGluZ190YWdzLnNldCBAIDMyLCB0YWdfYXNfZGlhZ25vc3RpYyAvLyBVUklcblxuXG5jb25zdCBDQk9SRGVjb2RlciA9IENCT1JEZWNvZGVyQmFzaWMub3B0aW9ucyBAOlxuICB0YWdzOiB0ZXN0aW5nX3RhZ3NcbiAgdHlwZXM6IEB7fVxuICAgIGhhbGZfZmxvYXRcbiAgICBieXRlcyh1OCkgOjogcmV0dXJuIGBoJyR7dThfdG9faGV4KHU4KX0nYFxuICAgIGJ5dGVzX3N0cmVhbSh1OCkgOjpcbiAgICAgIGxldCByZXMgPSBbXVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCBoX3U4KSA6OlxuICAgICAgICBpZiBkb25lIDo6IHJldHVybiBgKF8gJHtyZXMuam9pbignLCAnKX0pYFxuICAgICAgICByZXMucHVzaChoX3U4KVxuXG5kZXNjcmliZSBAICdEZWNvZGUgQ0JPUiBUZXN0IFZlY3RvcnMnLCBAPT4gOjpcbiAgZm9yIGNvbnN0IHRlc3Qgb2YgdGVzdF92ZWN0b3JzIDo6XG5cbiAgICBjb25zdCBpdF9mbiA9IHRlc3Quc2tpcCA/IGl0LnNraXAgOiB0ZXN0Lm9ubHkgPyBpdC5vbmx5IDogaXRcbiAgICBpdF9mbiBAIGBcIiR7dGVzdC5oZXh9XCIgdG8gJHt0ZXN0LmRpYWdub3N0aWMgfHwgSlNPTi5zdHJpbmdpZnkodGVzdC5kZWNvZGVkKX1gLCBAPT4gOjpcbiAgICAgIGNvbnN0IHU4ID0gaGV4X3RvX3U4IEAgdGVzdC5oZXhcblxuICAgICAgY29uc3QgYW5zID0gQ0JPUkRlY29kZXIuZGVjb2RlKHU4KVxuICAgICAgaWYgdGVzdC5kaWFnbm9zdGljIDo6XG4gICAgICAgIHRyeSA6OlxuICAgICAgICAgIGFzc2VydC5lcXVhbCBAIHRlc3QuZGlhZ25vc3RpYywgYW5zKycnXG4gICAgICAgIGNhdGNoIGVyciA6OlxuICAgICAgICAgIGNvbnNvbGUubG9nIEAjICdkaWFnJywgdGVzdC5kaWFnbm9zdGljLCBhbnNcbiAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgIGVsc2UgOjpcbiAgICAgICAgdHJ5IDo6XG4gICAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbCBAIHRlc3QuZGVjb2RlZCwgYW5zXG4gICAgICAgIGNhdGNoIGVyciA6OlxuICAgICAgICAgIGNvbnNvbGUubG9nIEAjICdkZWNvZGUnLCB0ZXN0LmRlY29kZWQsIGFuc1xuICAgICAgICAgIHRocm93IGVyclxuXG4iXSwibmFtZXMiOlsiaGFsZl9mbG9hdCIsImFzc2VydCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtFQUNFO0lBQ0U7O0VBRUY7OENBQzRDLEdBQUc7OEJBQ25CLEVBQUU7OztBQUdoQztFQUNFLGtCQUFrQixlQUFlLEVBQUUsRUFBRTtFQUNyQztFQUNBO0lBQ0U7RUFDRjs7QUNkRjtFQUNFLGdDQUFnQyxPQUFPOztBQUV6QyxnREFBZ0QsUUFBUTs7QUFFeEQ7RUFDRTtJQUNFO0VBQ0Y7SUFDRTtFQUNGO0lBQ0U7RUFDRjs7QUFFRjtFQUNFO0VBQ0E7SUFDRTtJQUNBLEtBQUssUUFBUTtNQUNYLGdCQUFnQix5QkFBeUI7SUFDM0M7O0VBRUY7RUFDQTtJQUNFO0lBQ0E7RUFDRjs7QUFFRjtFQUNFOzs7Ozs7SUFNRTtJQUNBO01BQ0U7UUFDRTtRQUNBO1FBQ0E7O01BRUY7Ozs7SUFJRjtJQUNBO01BQ0U7UUFDRSxxQkFBcUIsRUFBRTtRQUN2QjtRQUNBOztNQUVGOzs7Ozs7SUFNRjtJQUNBO01BQ0U7TUFDQTs7O0lBR0Y7SUFDQTtNQUNFO01BQ0E7Ozs7OztJQU1GO0lBQ0E7TUFDRTtNQUNBOzs7SUFHRjtJQUNBO01BQ0U7TUFDQTs7OztJQUlGOzs7OztNQUtFO01BQ0E7UUFDRTtRQUNBOzs7TUFHRjtNQUNBO1FBQ0U7UUFDQTs7OztJQUlKOzs7OztNQUtFO01BQ0E7UUFDRTtRQUNBOzs7TUFHRjtNQUNBO1FBQ0U7UUFDQTs7QUFFUixzQkFBc0IsS0FBSztBQUMzQjtFQUNFOztFQUVBOztFQUVBO0lBQ0U7SUFDQTs7SUFFQTtNQUNFOztJQUVGOzs7RUFHRjtJQUNFO0lBQ0E7O0lBRUE7TUFDRTs7SUFFRjtJQUNBO0lBQ0E7SUFDQTs7RUFFRjs7O0FBR0Y7RUFDRTs7RUFFQTtFQUNBO0VB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O0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTs7O0lBR0EsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsWUFBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFlBQVk7OztJQUdaLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsU0FBUzs7O0lBR1QsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFNBQVM7OztJQUdULE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxTQUFTOzs7SUFHVCxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsU0FBUzs7O0lBR1QsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBLFNBQVM7OztJQUdULE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxTQUFTOzs7SUFHVCxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsU0FBUzs7O0lBR1QsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsU0FBWTs7O0lBR1osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBO01BQ0U7T0FDRztPQUNBOzs7SUFHTCxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7TUFDRTtNQUNBOzs7SUFHRixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7Ozs7SUFJQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7OztJQUdBLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTtNQUNFLEdBQUc7TUFDSCxHQUFHO1FBQ0Q7UUFDQTs7O0lBR0osTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBO01BQ0U7T0FDSSxHQUFHLEVBQUU7OztJQUdYLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTtNQUNFLEdBQUcsRUFBRTtNQUNMLEdBQUcsRUFBRTtNQUNMLEdBQUcsRUFBRTtNQUNMLEdBQUcsRUFBRTtNQUNMLEdBQUcsRUFBRTs7OztJQUlQLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQSxZQUFZOzs7SUFHWixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0EsU0FBUzs7O0lBR1QsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBOzs7SUFHQSxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7TUFDRTtPQUNHO09BQ0E7OztJQUdMLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTtNQUNFO09BQ0c7T0FDQTs7O0lBR0wsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBO01BQ0U7T0FDRztPQUNBOzs7SUFHTCxNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7TUFDRTtPQUNHO09BQ0E7OztJQUdMLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTtNQUNFO01BQ0E7OztJQUdGLE1BQU07SUFDTixLQUFLO0lBQ0w7SUFDQTtNQUNFLEdBQUc7TUFDSCxHQUFHLEVBQUs7Ozs7SUFJVixNQUFNO0lBQ04sS0FBSztJQUNMO0lBQ0E7TUFDRTtPQUNJLEdBQUcsRUFBRTs7O0lBR1gsTUFBTTtJQUNOLEtBQUs7SUFDTDtJQUNBO01BQ0UsS0FBSztNQUNMLEtBQUs7Ozs7QUNwaEJYO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtJQUNJOzs7SUFHQTtRQUNJO1FBQ0E7UUFDQTtRQUNBOzs7O1FBSUE7UUFDQTtRQUNBO1FBQ0E7Ozs7UUFJQTtRQUNBO1FBQ0E7UUFDQTs7OztRQUlBO1FBQ0E7UUFDQTtRQUNBOzs7O1FBSUE7UUFDQTtRQUNBO1FBQ0E7Ozs7O0FBaUJSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0lBQ0k7SUFDQTs7O0lBR0E7UUFDSTtRQUNBOzs7SUFHSjtJQUNBOztJQUVBOztBQUVKO0lBQ0k7OztBQUdKO0FBQ0E7SUFDSTs7QUFFSjtBQUNBO0FBQ0E7SUFDSTs7QUFFSjs7QUFFQTtBQUNBO0lBQ0k7UUFDSTs7UUFFQTs7Ozs7Ozs7QUFRUjtJQUNJO0lBQ0E7SUFDQTs7QUFJSjtFQUNFOztBQ3ZIRixxQ0FBMkIsTUFBTTtBQUNqQzs7Ozs7QUFZQTtFQUNFLFlBQVksR0FBRyxJQUFJLEdBQUcsa0JBQWtCOztBQUUxQztFQUNFLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRTs7QUFFMUI7QUFDQSxpQkFBa0I7QUFDbEIsaUJBQWtCO0FBQ2xCLGlCQUFrQjtBQUNsQixpQkFBa0I7QUFDbEIsaUJBQWtCO0FBQ2xCLGlCQUFrQjtBQUNsQixpQkFBa0I7OztBQUdsQjtFQUNFO0VBQ0E7Z0JBQ0VBO0lBQ0EsV0FBWSxPQUFRLEtBQUssY0FBYztJQUN2QztNQUNFO01BQ0E7UUFDRSxJQUFFLE9BQVEsT0FBUSxNQUFNLFNBQVMsSUFBSSxFQUFFO1FBQ3ZDOztBQUVSLFNBQVUsMEJBQTJCO0VBQ25DLEtBQUc7O0lBRUQ7SUFDQSxNQUFPLElBQUssU0FBUyxPQUFPLGdEQUFnRCxDQUFDO01BQzNFLHFCQUFzQjs7TUFFdEI7TUFDQSxJQUFFO1FBQ0E7VUFDRUMsZUFBYyxxQkFBc0I7UUFDdEMsT0FBSztVQUNILGFBQWMsTUFBTztVQUNyQjs7UUFFRjtVQUNFQSxtQkFBa0I7UUFDcEIsT0FBSztVQUNILGFBQWMsUUFBUztVQUN2QiJ9
