(function () {
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
    return new TextDecoder('utf-8').decode(u8) }

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

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX191bml0dGVzdC5paWZlLmpzIiwic291cmNlcyI6WyIuLi8uLi9qcy11OC11dGlscy9lc20vaGV4LmpzIiwiLi4vZXNtL3dlYi9jYm9yX2RlY29kZS5qcyIsInVuaXQvdGVzdF9kZWNvZGVfYmFzaWNfdGFncy5qc3kiLCJ1bml0L2FwcGVuZGl4X2EuanN5IiwiLi4vZXNtL2hhbGZfZmxvYXQuanMiLCJ1bml0L3Rlc3RfZGVjb2RlX3ZlY3RvcnMuanN5Il0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHU4X3RvX2hleCh1OCwgc2VwKSB7XG4gIGlmICh1bmRlZmluZWQgPT09IHU4LmJ1ZmZlcikge1xuICAgIHU4ID0gbmV3IFVpbnQ4QXJyYXkodTgpO31cblxuICByZXR1cm4gQXJyYXlcbiAgICAuZnJvbSh1OCwgdiA9PiB2LnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKVxuICAgIC5qb2luKG51bGwgIT0gc2VwID8gc2VwIDogJycpIH1cblxuXG5mdW5jdGlvbiBoZXhfdG9fdTgoaGV4KSB7XG4gIGhleCA9IGhleC5yZXBsYWNlKC9bXjAtOWEtZkEtRl0vZywgJycpO1xuICBjb25zdCB1OCA9IG5ldyBVaW50OEFycmF5KGhleC5sZW5ndGggPj4gMSk7XG4gIGZvciAobGV0IGk9MCwgaTI9MDsgaTx1OC5sZW5ndGg7IGkrKywgaTIrPTIpIHtcbiAgICB1OFtpXSA9IHBhcnNlSW50KGhleC5zbGljZShpMiwgaTIrMiksIDE2KTsgfVxuICByZXR1cm4gdTh9XG5cbmV4cG9ydCB7IHU4X3RvX2hleCwgaGV4X3RvX3U4IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1oZXguanMubWFwXG4iLCJmdW5jdGlvbiB1OF90b191dGY4KHU4KSB7XG4gIHJldHVybiBuZXcgVGV4dERlY29kZXIoJ3V0Zi04JykuZGVjb2RlKHU4KSB9XG5cbmZ1bmN0aW9uIGFzX3U4X2J1ZmZlcih1OCkge1xuICBpZiAodTggaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgcmV0dXJuIHU4fVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHU4KSkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheSh1OC5idWZmZXIpfVxuICBpZiAodTggaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheSh1OCl9XG4gIHJldHVybiBVaW50OEFycmF5LmZyb20odTgpfVxuXG5mdW5jdGlvbiB1OF9jb25jYXQocGFydHMpIHtcbiAgbGV0IGk9MCwgbGVuPTA7XG4gIGZvciAoY29uc3QgYiBvZiBwYXJ0cykge1xuICAgIGNvbnN0IGJ5dGVMZW5ndGggPSBiLmJ5dGVMZW5ndGg7XG4gICAgaWYgICgnbnVtYmVyJyAhPT0gdHlwZW9mIGJ5dGVMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFydCBieXRlTGVuZ3RoXCIpIH1cbiAgICBsZW4gKz0gYnl0ZUxlbmd0aDt9XG5cbiAgY29uc3QgdTggPSBuZXcgVWludDhBcnJheShsZW4pO1xuICBmb3IgKGNvbnN0IHU4X3BhcnQgb2YgcGFydHMpIHtcbiAgICB1OC5zZXQodThfcGFydCwgaSk7XG4gICAgaSArPSB1OF9wYXJ0LmJ5dGVMZW5ndGg7fVxuICByZXR1cm4gdTh9XG5cbmNvbnN0IGRlY29kZV90eXBlcyA9e1xuICBfX3Byb3RvX186IG51bGxcblxuLCBoYWxmX2Zsb2F0KHU4KSB7cmV0dXJuIHU4fVxuXG4sIGJ5dGVzKHU4KSB7cmV0dXJuIHU4fVxuLCBieXRlc19zdHJlYW0oZGVjb2Rlcikge1xuICAgIGxldCByZXMgPSBbXTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGksIHU4KSB7XG4gICAgICBpZiAoZG9uZSkge1xuICAgICAgICBjb25zdCBhbnMgPSB1OF9jb25jYXQocmVzKTtcbiAgICAgICAgcmVzID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGFuc31cblxuICAgICAgcmVzLnB1c2godTgpO30gfVxuXG4sIHV0ZjgodTgpIHtyZXR1cm4gdThfdG9fdXRmOCh1OCl9XG4sIHV0Zjhfc3RyZWFtKGRlY29kZXIpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCBzdHIpIHtcbiAgICAgIGlmIChkb25lKSB7XG4gICAgICAgIGNvbnN0IGFucyA9IHJlcy5qb2luKCcnKTtcbiAgICAgICAgcmVzID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGFuc31cblxuICAgICAgcmVzLnB1c2goc3RyKTt9IH1cblxuXG4sIGVtcHR5X2xpc3QoKSB7cmV0dXJuIFtdfVxuXG4sIGxpc3QoZGVjb2RlciwgbGVuKSB7XG4gICAgbGV0IHJlcyA9IDAgPT09IGxlbiA/IFtdIDogbmV3IEFycmF5KGxlbik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCB2KSB7XG4gICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICByZXNbaV0gPSB2O30gfVxuXG4sIGxpc3Rfc3RyZWFtKGRlY29kZXIpIHtcbiAgICBsZXQgcmVzID0gW107XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCB2KSB7XG4gICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICByZXMucHVzaCh2KTt9IH1cblxuXG4sIGVtcHR5X21hcCgpIHtyZXR1cm4ge319XG5cbiwgbWFwKGRlY29kZXIpIHtcbiAgICBsZXQgcmVzID0ge307XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBrLCB2KSB7XG4gICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICByZXNba10gPSB2O30gfVxuXG4sIG1hcF9zdHJlYW0oZGVjb2Rlcikge1xuICAgIGxldCByZXMgPSB7fTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGssIHYpIHtcbiAgICAgIGlmIChkb25lKSB7cmV0dXJuIHJlc31cbiAgICAgIHJlc1trXSA9IHY7fSB9XG5cblxuLCBNYXA6e1xuICAgIF9fcHJvdG9fXzogbnVsbFxuXG4gICwgZW1wdHlfbWFwKCkge3JldHVybiBuZXcgTWFwKCl9XG5cbiAgLCBtYXAoZGVjb2Rlcikge1xuICAgICAgbGV0IHJlcyA9IG5ldyBNYXAoKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZG9uZSwgaywgdikge1xuICAgICAgICBpZiAoZG9uZSkge3JldHVybiByZXN9XG4gICAgICAgIHJlcy5zZXQoaywgdik7fSB9XG5cbiAgLCBtYXBfc3RyZWFtKGRlY29kZXIpIHtcbiAgICAgIGxldCByZXMgPSBuZXcgTWFwKCk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGssIHYpIHtcbiAgICAgICAgaWYgKGRvbmUpIHtyZXR1cm4gcmVzfVxuICAgICAgICByZXMuc2V0KGssIHYpO30gfSB9XG5cblxuLCBTZXQ6e1xuICAgIF9fcHJvdG9fXzogbnVsbFxuXG4gICwgZW1wdHlfbGlzdCgpIHtyZXR1cm4gbmV3IFNldCgpfVxuXG4gICwgbGlzdChkZWNvZGVyKSB7XG4gICAgICBsZXQgcmVzID0gbmV3IFNldCgpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkb25lLCBpLCB2KSB7XG4gICAgICAgIGlmIChkb25lKSB7cmV0dXJuIHJlc31cbiAgICAgICAgcmVzLmFkZCh2KTt9IH1cblxuICAsIGxpc3Rfc3RyZWFtKGRlY29kZXIpIHtcbiAgICAgIGxldCByZXMgPSBuZXcgU2V0KCk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGksIHYpIHtcbiAgICAgICAgaWYgKGRvbmUpIHtyZXR1cm4gcmVzfVxuICAgICAgICByZXMuYWRkKHYpO30gfSB9IH07XG5cbmZ1bmN0aW9uIGRlY29kZV9qdW1wKG9wdGlvbnMsIGptcCkge1xuICBqbXAgPSBqbXAgPyBqbXAuc2xpY2UoKSA6IGRlY29kZV9iYXNpY19qdW1wKCk7XG5cbiAgaWYgKG51bGwgPT0gb3B0aW9ucykge29wdGlvbnMgPSB7fTt9XG5cbiAgaWYgKG9wdGlvbnMuc2ltcGxlKSB7XG4gICAgY29uc3Qgc2ltcGxlX3ZhbHVlID0gYmluZF9zaW1wbGVfZGlzcGF0Y2gob3B0aW9ucy5zaW1wbGUpO1xuICAgIGNvbnN0IHRpbnlfc2ltcGxlID0gX2Nib3JfdGlueShzaW1wbGVfdmFsdWUpO1xuXG4gICAgZm9yIChsZXQgaT0weGUwOyBpPD0gMHhmMzsgaSsrKSB7XG4gICAgICBqbXBbaV0gPSB0aW55X3NpbXBsZTt9XG5cbiAgICBqbXBbMHhmOF0gPSBfY2Jvcl93MShzaW1wbGVfdmFsdWUpOyB9XG5cblxuICBpZiAob3B0aW9ucy50YWdzKSB7XG4gICAgY29uc3QgYXNfdGFnID0gYmluZF90YWdfZGlzcGF0Y2gob3B0aW9ucy50YWdzKTtcbiAgICBjb25zdCB0aW55X3RhZyA9IF9jYm9yX3RpbnkoYXNfdGFnKTtcblxuICAgIGZvciAobGV0IGk9MHhjMDsgaTw9IDB4ZDc7IGkrKykge1xuICAgICAgam1wWzB4YzAgfCBpXSA9IHRpbnlfdGFnO31cblxuICAgIGptcFsweGQ4XSA9IF9jYm9yX3cxKGFzX3RhZyk7XG4gICAgam1wWzB4ZDldID0gX2Nib3JfdzIoYXNfdGFnKTtcbiAgICBqbXBbMHhkYV0gPSBfY2Jvcl93NChhc190YWcpO1xuICAgIGptcFsweGRiXSA9IF9jYm9yX3c4KGFzX3RhZyk7IH1cblxuICByZXR1cm4gam1wfVxuXG5cbmZ1bmN0aW9uIGRlY29kZV9iYXNpY19qdW1wKCkge1xuICBjb25zdCBhc190YWcgPSBiaW5kX3RhZ19kaXNwYXRjaChiYXNpY190YWdzKCkpO1xuXG4gIGNvbnN0IHRpbnlfcG9zX2ludCA9IF9jYm9yX3RpbnkoYXNfcG9zX2ludCk7XG4gIGNvbnN0IHRpbnlfbmVnX2ludCA9IF9jYm9yX3RpbnkoYXNfbmVnX2ludCk7XG4gIGNvbnN0IHRpbnlfYnl0ZXMgPSBfY2Jvcl90aW55KGFzX2J5dGVzKTtcbiAgY29uc3QgdGlueV91dGY4ID0gX2Nib3JfdGlueShhc191dGY4KTtcbiAgY29uc3QgdGlueV9saXN0ID0gX2Nib3JfdGlueShhc19saXN0KTtcbiAgY29uc3QgdGlueV9tYXAgPSBfY2Jvcl90aW55KGFzX21hcCk7XG4gIGNvbnN0IHRpbnlfdGFnID0gX2Nib3JfdGlueShhc190YWcpO1xuICBjb25zdCB0aW55X3NpbXBsZV9yZXByID0gX2Nib3JfdGlueShzaW1wbGVfcmVwcik7XG5cbiAgY29uc3Qgam1wID0gbmV3IEFycmF5KDI1Nik7XG5cbiAgZm9yIChsZXQgaT0wOyBpPD0gMjM7IGkrKykge1xuICAgIGptcFsweDAwIHwgaV0gPSB0aW55X3Bvc19pbnQ7XG4gICAgam1wWzB4MjAgfCBpXSA9IHRpbnlfbmVnX2ludDtcbiAgICBqbXBbMHg0MCB8IGldID0gdGlueV9ieXRlcztcbiAgICBqbXBbMHg2MCB8IGldID0gdGlueV91dGY4O1xuICAgIGptcFsweDgwIHwgaV0gPSB0aW55X2xpc3Q7XG4gICAgam1wWzB4YTAgfCBpXSA9IHRpbnlfbWFwO1xuICAgIGptcFsweGMwIHwgaV0gPSB0aW55X3RhZztcbiAgICBqbXBbMHhlMCB8IGldID0gdGlueV9zaW1wbGVfcmVwcjt9XG5cbiAgY29uc3QgY2Jvcl93aWR0aHMgPVtfY2Jvcl93MSwgX2Nib3JfdzIsIF9jYm9yX3c0LCBfY2Jvcl93OF07XG4gIGZvciAobGV0IHc9MDsgdzwgNDsgdysrKSB7XG4gICAgY29uc3QgaSA9IDI0K3csIHdpZHRoID0gY2Jvcl93aWR0aHNbd107XG4gICAgam1wWzB4MDAgfCBpXSA9IHdpZHRoKGFzX3Bvc19pbnQpO1xuICAgIGptcFsweDIwIHwgaV0gPSB3aWR0aChhc19uZWdfaW50KTtcbiAgICBqbXBbMHg0MCB8IGldID0gd2lkdGgoYXNfYnl0ZXMpO1xuICAgIGptcFsweDYwIHwgaV0gPSB3aWR0aChhc191dGY4KTtcbiAgICBqbXBbMHg4MCB8IGldID0gd2lkdGgoYXNfbGlzdCk7XG4gICAgam1wWzB4YTAgfCBpXSA9IHdpZHRoKGFzX21hcCk7XG4gICAgam1wWzB4YzAgfCBpXSA9IHdpZHRoKGFzX3RhZyk7IH1cblxuICAvLyBzdHJlYW1pbmcgZGF0YSB0eXBlc1xuICBqbXBbMHg1Zl0gPSBhc19ieXRlc19zdHJlYW07XG4gIGptcFsweDdmXSA9IGFzX3V0Zjhfc3RyZWFtO1xuICBqbXBbMHg5Zl0gPSBhc19saXN0X3N0cmVhbTtcbiAgam1wWzB4YmZdID0gYXNfbWFwX3N0cmVhbTtcblxuICAvLyBzZW1hbnRpYyB0YWdcblxuICAvLyBwcmltaXRpdmVzXG4gIGptcFsweGY0XSA9IGZ1bmN0aW9uKCkge3JldHVybiBmYWxzZX07XG4gIGptcFsweGY1XSA9IGZ1bmN0aW9uKCkge3JldHVybiB0cnVlfTtcbiAgam1wWzB4ZjZdID0gZnVuY3Rpb24oKSB7cmV0dXJuIG51bGx9O1xuICBqbXBbMHhmN10gPSBmdW5jdGlvbigpIHt9Oy8vIHVuZGVmaW5lZFxuICBqbXBbMHhmOF0gPSBfY2Jvcl93MShzaW1wbGVfcmVwcik7XG4gIGptcFsweGY5XSA9IGhhbGZfZmxvYXQ7XG4gIGptcFsweGZhXSA9IHNpbmdsZV9mbG9hdDtcbiAgam1wWzB4ZmJdID0gZG91YmxlX2Zsb2F0O1xuICAvL2ptcFsweGZjXSA9IHVuZGVmaW5lZFxuICAvL2ptcFsweGZkXSA9IHVuZGVmaW5lZFxuICAvL2ptcFsweGZlXSA9IHVuZGVmaW5lZFxuICBqbXBbMHhmZl0gPSBmdW5jdGlvbiAoKSB7cmV0dXJuIGNib3JfYnJlYWtfc3ltfTtcblxuICByZXR1cm4gam1wfVxuXG5cbi8vIHNwZWNpYWwgdG9rZW5cbmNvbnN0IGNib3JfYnJlYWtfc3ltID0gU3ltYm9sKCdjYm9yX2JyZWFrJyk7XG5cbi8vIGNib3Igc2l6ZS92YWx1ZSBpbnRlcnByZXRlcnNcbmZ1bmN0aW9uIF9jYm9yX3RpbnkoYXNfdHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGRlY29kZXIsIHR5cGVfYikge1xuICAgIHJldHVybiBhc190eXBlKGRlY29kZXIsIHR5cGVfYiAmIDB4MWYpfSB9XG5cbmZ1bmN0aW9uIF9jYm9yX3cxKGFzX3R5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgY29uc3QgaWR4ID0gZGVjb2Rlci5pZHg7XG4gICAgZGVjb2Rlci5pZHggPSBpZHggKyAxO1xuICAgIHJldHVybiBhc190eXBlKGRlY29kZXIsXG4gICAgICBkZWNvZGVyLmR2LmdldFVpbnQ4KGlkeCkpIH0gfVxuXG5mdW5jdGlvbiBfY2Jvcl93Mihhc190eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGVjb2Rlcikge1xuICAgIGNvbnN0IGlkeCA9IGRlY29kZXIuaWR4O1xuICAgIGRlY29kZXIuaWR4ID0gaWR4ICsgMjtcbiAgICByZXR1cm4gYXNfdHlwZShkZWNvZGVyLFxuICAgICAgZGVjb2Rlci5kdi5nZXRVaW50MTYoaWR4KSkgfSB9XG5cbmZ1bmN0aW9uIF9jYm9yX3c0KGFzX3R5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgY29uc3QgaWR4ID0gZGVjb2Rlci5pZHg7XG4gICAgZGVjb2Rlci5pZHggPSBpZHggKyA0O1xuICAgIHJldHVybiBhc190eXBlKGRlY29kZXIsXG4gICAgICBkZWNvZGVyLmR2LmdldFVpbnQzMihpZHgpKSB9IH1cblxuZnVuY3Rpb24gX2Nib3JfdzgoYXNfdHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGRlY29kZXIpIHtcbiAgICBjb25zdCBpZHggPSBkZWNvZGVyLmlkeDtcbiAgICBkZWNvZGVyLmlkeCA9IGlkeCArIDg7XG5cbiAgICBjb25zdCB2X2hpID0gZGVjb2Rlci5kdi5nZXRVaW50MzIoaWR4KzApO1xuICAgIGNvbnN0IHZfbG8gPSBkZWNvZGVyLmR2LmdldFVpbnQzMihpZHgrNCk7XG4gICAgY29uc3QgdTY0ID0gdl9sbyArIDB4MTAwMDAwMDAwKnZfaGk7XG4gICAgcmV0dXJuIGFzX3R5cGUoZGVjb2RlciwgdTY0KSB9IH1cblxuXG4vLyBiYXNpYyB0eXBlc1xuXG5mdW5jdGlvbiBhc19wb3NfaW50KGRlY29kZXIsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZX1cblxuZnVuY3Rpb24gYXNfbmVnX2ludChkZWNvZGVyLCB2YWx1ZSkge1xuICByZXR1cm4gLTEgLSB2YWx1ZX1cblxuZnVuY3Rpb24gYXNfYnl0ZXMoZGVjb2RlciwgbGVuKSB7XG4gIGNvbnN0IHtpZHgsIHU4fSA9IGRlY29kZXI7XG4gIGRlY29kZXIuaWR4ID0gaWR4ICsgbGVuO1xuICByZXR1cm4gZGVjb2Rlci50eXBlcy5ieXRlcyhcbiAgICB1OC5zdWJhcnJheShpZHgsIGlkeCArIGxlbikpIH1cblxuZnVuY3Rpb24gYXNfdXRmOChkZWNvZGVyLCBsZW4pIHtcbiAgY29uc3Qge2lkeCwgdTh9ID0gZGVjb2RlcjtcbiAgZGVjb2Rlci5pZHggPSBpZHggKyBsZW47XG4gIHJldHVybiBkZWNvZGVyLnR5cGVzLnV0ZjgoXG4gICAgdTguc3ViYXJyYXkoaWR4LCBpZHggKyBsZW4pKSB9XG5cbmZ1bmN0aW9uIGFzX2xpc3QoZGVjb2RlciwgbGVuKSB7XG4gIGlmICgwID09PSBsZW4pIHtcbiAgICByZXR1cm4gZGVjb2Rlci50eXBlcy5lbXB0eV9saXN0KCl9XG5cbiAgY29uc3QgcmVzID0gZGVjb2Rlci50eXBlcy5saXN0KGxlbik7XG4gIGZvciAobGV0IGk9MDsgaTxsZW47IGkrKykge1xuICAgIHJlcyhmYWxzZSwgaSwgZGVjb2Rlci5uZXh0VmFsdWUoKSk7IH1cbiAgcmV0dXJuIHJlcyh0cnVlKX1cblxuZnVuY3Rpb24gYXNfbWFwKGRlY29kZXIsIGxlbikge1xuICBpZiAoMCA9PT0gbGVuKSB7XG4gICAgcmV0dXJuIGRlY29kZXIudHlwZXMuZW1wdHlfbWFwKCl9XG5cbiAgY29uc3QgcmVzID0gZGVjb2Rlci50eXBlcy5tYXAobGVuKTtcbiAgZm9yIChsZXQgaT0wOyBpPGxlbjsgaSsrKSB7XG4gICAgY29uc3Qga2V5ID0gZGVjb2Rlci5uZXh0VmFsdWUoKTtcbiAgICBjb25zdCB2YWx1ZSA9IGRlY29kZXIubmV4dFZhbHVlKCk7XG4gICAgcmVzKGZhbHNlLCBrZXksIHZhbHVlKTsgfVxuICByZXR1cm4gcmVzKHRydWUpfVxuXG5cbi8vIHN0cmVhbWluZ1xuXG5mdW5jdGlvbiBhc19zdHJlYW0oZGVjb2RlciwgYWNjdW0pIHtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IHZhbHVlID0gZGVjb2Rlci5uZXh0VmFsdWUoKTtcbiAgICBpZiAoY2Jvcl9icmVha19zeW0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gYWNjdW0odHJ1ZSkgfVxuICAgIGFjY3VtKGZhbHNlLCBpKyssIHZhbHVlKTsgfSB9XG5cbmZ1bmN0aW9uIGFzX3BhaXJfc3RyZWFtKGRlY29kZXIsIGFjY3VtKSB7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3Qga2V5ID0gZGVjb2Rlci5uZXh0VmFsdWUoKTtcbiAgICBpZiAoY2Jvcl9icmVha19zeW0gPT09IGtleSkge1xuICAgICAgcmV0dXJuIGFjY3VtKHRydWUpIH1cbiAgICBhY2N1bShmYWxzZSwga2V5LCBkZWNvZGVyLm5leHRWYWx1ZSgpKTsgfSB9XG5cbmZ1bmN0aW9uIGFzX2J5dGVzX3N0cmVhbShkZWNvZGVyKSB7XG4gIHJldHVybiBhc19zdHJlYW0oZGVjb2RlciwgZGVjb2Rlci50eXBlcy5ieXRlc19zdHJlYW0oZGVjb2RlcikpIH1cblxuZnVuY3Rpb24gYXNfdXRmOF9zdHJlYW0oZGVjb2Rlcikge1xuICByZXR1cm4gYXNfc3RyZWFtKGRlY29kZXIsIGRlY29kZXIudHlwZXMudXRmOF9zdHJlYW0oZGVjb2RlcikpIH1cblxuZnVuY3Rpb24gYXNfbGlzdF9zdHJlYW0oZGVjb2Rlcikge1xuICByZXR1cm4gYXNfc3RyZWFtKGRlY29kZXIsIGRlY29kZXIudHlwZXMubGlzdF9zdHJlYW0oZGVjb2RlcikpIH1cblxuZnVuY3Rpb24gYXNfbWFwX3N0cmVhbShkZWNvZGVyKSB7XG4gIHJldHVybiBhc19wYWlyX3N0cmVhbShkZWNvZGVyLCBkZWNvZGVyLnR5cGVzLm1hcF9zdHJlYW0oZGVjb2RlcikpIH1cblxuXG4vLyBwcmltaXRpdmVzXG5cbmZ1bmN0aW9uIGhhbGZfZmxvYXQoZGVjb2Rlcikge1xuICBjb25zdCB7aWR4LCB1OH0gPSBkZWNvZGVyO1xuICBkZWNvZGVyLmlkeCA9IGlkeCArIDI7XG4gIHJldHVybiBkZWNvZGVyLnR5cGVzLmhhbGZfZmxvYXQoXG4gICAgdTguc3ViYXJyYXkoaWR4LCBpZHgrMikpIH1cblxuZnVuY3Rpb24gc2luZ2xlX2Zsb2F0KGRlY29kZXIpIHtcbiAgY29uc3Qge2lkeCwgZHZ9ID0gZGVjb2RlcjtcbiAgZGVjb2Rlci5pZHggPSBpZHggKyA0O1xuICByZXR1cm4gZHYuZ2V0RmxvYXQzMihpZHgpfVxuXG5mdW5jdGlvbiBkb3VibGVfZmxvYXQoZGVjb2Rlcikge1xuICBjb25zdCB7aWR4LCBkdn0gPSBkZWNvZGVyO1xuICBkZWNvZGVyLmlkeCA9IGlkeCArIDg7XG4gIHJldHVybiBkdi5nZXRGbG9hdDY0KGlkeCl9XG5cblxuLy8gc2ltcGxlIHZhbHVlc1xuXG5mdW5jdGlvbiBzaW1wbGVfcmVwcihkZWNvZGVyLCBrZXkpIHtcbiAgcmV0dXJuIGBzaW1wbGUoJHtrZXl9KWB9XG5cbmZ1bmN0aW9uIGJpbmRfc2ltcGxlX2Rpc3BhdGNoKHNpbXBsZV9sdXQpIHtcbiAgaWYgICgnZnVuY3Rpb24nICE9PSB0eXBlb2Ygc2ltcGxlX2x1dC5nZXQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHNpbXBsZV92YWx1ZSBNYXAnKSB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGRlY29kZXIsIGtleSkge1xuICAgIHJldHVybiBzaW1wbGVfbHV0LmdldChrZXkpfSB9XG5cblxuLy8gdGFnIHZhbHVlc1xuXG5mdW5jdGlvbiBiaW5kX3RhZ19kaXNwYXRjaCh0YWdzX2x1dCkge1xuICBpZiAgKCdmdW5jdGlvbicgIT09IHR5cGVvZiB0YWdzX2x1dC5nZXQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHRhZ3MgTWFwJykgfVxuXG4gIHJldHVybiBmdW5jdGlvbihkZWNvZGVyLCB0YWcpIHtcbiAgICBjb25zdCB0YWdfaGFuZGxlciA9IHRhZ3NfbHV0LmdldCh0YWcpO1xuICAgIGlmICh0YWdfaGFuZGxlcikge1xuICAgICAgY29uc3QgcmVzID0gdGFnX2hhbmRsZXIoZGVjb2RlciwgdGFnKTtcbiAgICAgIGNvbnN0IGJvZHkgPSBkZWNvZGVyLm5leHRWYWx1ZSgpO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZCA9PT0gcmVzID8gYm9keSA6IHJlcyhib2R5KX1cblxuICAgIHJldHVybiB7dGFnLCBib2R5OiBkZWNvZGVyLm5leHRWYWx1ZSgpfSB9IH1cblxuXG5mdW5jdGlvbiBiYXNpY190YWdzKCkge1xuICAvLyBmcm9tIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDQ5I3NlY3Rpb24tMi40XG5cbiAgY29uc3QgdGFnc19sdXQgPSBuZXcgTWFwKCk7XG5cbiAgLy8gU3RhbmRhcmQgZGF0ZS90aW1lIHN0cmluZzsgc2VlIFNlY3Rpb24gMi40LjFcbiAgdGFnc19sdXQuc2V0KDAsICgpID0+IHRzX3N6ID0+IG5ldyBEYXRlKHRzX3N6KSk7XG4gIC8vIEVwb2NoLWJhc2VkIGRhdGUvdGltZTsgc2VlIFNlY3Rpb24gMi40LjFcbiAgdGFnc19sdXQuc2V0KDEsICgpID0+IHNlY29uZHMgPT4gbmV3IERhdGUoc2Vjb25kcyAqIDEwMDApKTtcblxuICAvLyBQb3NpdGl2ZSBiaWdudW07IHNlZSBTZWN0aW9uIDIuNC4yXG4gIC8vIHRhZ3NfbHV0LnNldCBAIDIsICgpID0+IHYgPT4gdlxuXG4gIC8vIE5lZ2F0aXZlIGJpZ251bTsgc2VlIFNlY3Rpb24gMi40LjJcbiAgLy8gdGFnc19sdXQuc2V0IEAgMywgKCkgPT4gdiA9PiB2XG5cbiAgLy8gRGVjaW1hbCBmcmFjdGlvbjsgc2VlIFNlY3Rpb24gMi40LjNcbiAgLy8gdGFnc19sdXQuc2V0IEAgNCwgKCkgPT4gdiA9PiB2XG5cbiAgLy8gQmlnZmxvYXQ7IHNlZSBTZWN0aW9uIDIuNC4zXG4gIC8vIHRhZ3NfbHV0LnNldCBAIDUsICgpID0+IHYgPT4gdlxuXG4gIC8vIEV4cGVjdGVkIGNvbnZlcnNpb24gdG8gYmFzZTY0dXJsIGVuY29kaW5nOyBzZWUgU2VjdGlvbiAyLjQuNC4yXG4gIC8vIHRhZ3NfbHV0LnNldCBAIDIxLCAoKSA9PiB2ID0+IHZcblxuICAvLyBFeHBlY3RlZCBjb252ZXJzaW9uIHRvIGJhc2U2NCBlbmNvZGluZzsgc2VlIFNlY3Rpb24gMi40LjQuMlxuICAvLyB0YWdzX2x1dC5zZXQgQCAyMiwgKCkgPT4gdiA9PiB2XG5cbiAgLy8gRXhwZWN0ZWQgY29udmVyc2lvbiB0byBiYXNlMTYgZW5jb2Rpbmc7IHNlZSBTZWN0aW9uIDIuNC40LjJcbiAgLy8gdGFnc19sdXQuc2V0IEAgMjMsICgpID0+IHYgPT4gdlxuXG4gIC8vIEVuY29kZWQgQ0JPUiBkYXRhIGl0ZW07IHNlZSBTZWN0aW9uIDIuNC40LjFcbiAgdGFnc19sdXQuc2V0KDI0LCBkZWNvZGVyID0+IHU4ID0+XG4gICAgdTggaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gZGVjb2Rlci53aXRoRGVjb2RlQ0JPUih1OCkgOiB1OCk7XG5cbiAgLy8gVVJJOyBzZWUgU2VjdGlvbiAyLjQuNC4zXG4gIHRhZ3NfbHV0LnNldCgzMiwgKCkgPT4gdXJsX3N6ID0+IG5ldyBVUkwodXJsX3N6KSk7XG5cbiAgLy8gYmFzZTY0dXJsOyBzZWUgU2VjdGlvbiAyLjQuNC4zXG4gIC8vdGFnc19sdXQuc2V0IEAgMzMsICgpID0+IHYgPT4gdlxuXG4gIC8vIGJhc2U2NDsgc2VlIFNlY3Rpb24gMi40LjQuM1xuICAvL3RhZ3NfbHV0LnNldCBAIDM0LCAoKSA9PiB2ID0+IHZcblxuICAvLyBSZWd1bGFyIGV4cHJlc3Npb247IHNlZSBTZWN0aW9uIDIuNC40LjNcbiAgLy90YWdzX2x1dC5zZXQgQCAzNSwgKCkgPT4gdiA9PiB2XG5cbiAgLy8gTUlNRSBtZXNzYWdlOyBzZWUgU2VjdGlvbiAyLjQuNC4zXG4gIC8vdGFnc19sdXQuc2V0IEAgMzYsICgpID0+IHYgPT4gdlxuXG4gIC8vIFNlbGYtZGVzY3JpYmUgQ0JPUjsgc2VlIFNlY3Rpb24gMi40LjVcbiAgdGFnc19sdXQuc2V0KDU1Nzk5LCAoKSA9PiB7fSApO1xuXG5cbiAgLy8gRVhURU5TSU9OU1xuXG4gIC8vIENCT1IgU2V0cyBodHRwczovL2dpdGh1Yi5jb20vaW5wdXQtb3V0cHV0LWhrL2Nib3Itc2V0cy1zcGVjL2Jsb2IvbWFzdGVyL0NCT1JfU0VUUy5tZFxuICB0YWdzX2x1dC5zZXQoMjU4LCBkZWNvZGVyID0+IHtkZWNvZGVyLnB1c2hUeXBlcygnU2V0Jyk7fSApO1xuXG4gIHJldHVybiB0YWdzX2x1dH1cblxuZnVuY3Rpb24gY2Jvcl91OF9kZWNvZGUodTgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIENCT1JEZWNvZGVyLmRlY29kZSh1OCl9XG5cblxuY2xhc3MgQ0JPUkRlY29kZXJCYXNpYyB7XG4gIHN0YXRpYyBjcmVhdGUodTgpIHtyZXR1cm4gbmV3IHRoaXModTgpfVxuICBzdGF0aWMgZGVjb2RlKHU4KSB7cmV0dXJuIG5ldyB0aGlzKHU4KS5uZXh0VmFsdWUoKX1cblxuICBzdGF0aWMgd2l0aERlY29kZUNCT1IodTgpIHtcbiAgICB1OC5kZWNvZGVDQk9SID0oKCk9PnRoaXMuZGVjb2RlKHU4KSk7XG4gICAgcmV0dXJuIHU4fVxuICB3aXRoRGVjb2RlQ0JPUih1OCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLndpdGhEZWNvZGVDQk9SKHU4KX1cblxuICBzdGF0aWMgb3B0aW9ucyhvcHRpb25zKSB7XG4gICAgaWYgICghIG9wdGlvbnMpIHtyZXR1cm4gdGhpc31cblxuICAgIGNsYXNzIENCT1JEZWNvZGVyXyBleHRlbmRzIHRoaXMge31cblxuICAgIGNvbnN0IGptcCA9IGRlY29kZV9qdW1wKG9wdGlvbnMsIHRoaXMuam1wKTtcbiAgICBDQk9SRGVjb2Rlcl8ucHJvdG90eXBlLmptcCA9IGptcDtcblxuICAgIGlmIChvcHRpb25zLnR5cGVzKSB7XG4gICAgICBjb25zdCB0eXBlcyA9IE9iamVjdC5jcmVhdGUodGhpcy5wcm90b3R5cGUudHlwZXMpO1xuICAgICAgQ0JPUkRlY29kZXJfLnByb3RvdHlwZS50eXBlcyA9IHR5cGVzO1xuXG4gICAgICBPYmplY3QuYXNzaWduKHR5cGVzLCBvcHRpb25zLnR5cGVzKTt9XG5cbiAgICByZXR1cm4gQ0JPUkRlY29kZXJffVxuXG4gIGNvbnN0cnVjdG9yKHU4KSB7XG4gICAgdTggPSBhc191OF9idWZmZXIodTgpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcyx7XG4gICAgICB1ODp7dmFsdWU6IHU4fVxuICAgICwgZHY6e3ZhbHVlOiBuZXcgRGF0YVZpZXcodTguYnVmZmVyKX0gfSApO1xuXG4gICAgdGhpcy5pZHggPSAwO1xuXG4gICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICB0aGlzLnR5cGVzdGFjayA9IHN0YWNrO1xuICAgIHRoaXMudHlwZXMgPSB0aGlzLnR5cGVzO1xuXG4gICAgY29uc3Qgam1wID0gdGhpcy5qbXA7XG4gICAgdGhpcy5uZXh0ID0oKCk9PiB7XG4gICAgICBjb25zdCB0eXBlX2IgPSB1OFsgdGhpcy5pZHggKysgXTtcbiAgICAgIGlmICh1bmRlZmluZWQgPT09IHR5cGVfYikge1xuICAgICAgICByZXR1cm4ge2RvbmU6IHRydWV9IH1cblxuICAgICAgaWYgKDAgIT09IHN0YWNrLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnR5cGVzID0gc3RhY2sucG9wKCk7fVxuXG4gICAgICBjb25zdCBkZWNvZGUgPSBqbXBbdHlwZV9iXSB8fCB0aGlzLmRlY29kZV91bmtub3duO1xuICAgICAgY29uc3QgdmFsdWUgPSBkZWNvZGUodGhpcywgdHlwZV9iKTtcbiAgICAgIHJldHVybiB7ZG9uZTogY2Jvcl9icmVha19zeW0gPT09IHZhbHVlLCB2YWx1ZX0gfSApOyB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7cmV0dXJuIHRoaXN9XG5cbiAgbmV4dFZhbHVlKCkge1xuICAgIGNvbnN0IHt2YWx1ZSwgZG9uZX0gPSB0aGlzLm5leHQoKTtcbiAgICBpZiAoZG9uZSAmJiBjYm9yX2JyZWFrX3N5bSAhPT0gdmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ0JPUiBkZWNvZGUgcGFzdCB0aGUgZW5kIG9mIGJ1ZmZlcicpIH1cbiAgICByZXR1cm4gdmFsdWV9XG5cbiAgcHVzaFR5cGVzKHR5cGVzKSB7XG4gICAgaWYgICgnc3RyaW5nJyA9PT0gdHlwZW9mIHR5cGVzKSB7XG4gICAgICB0eXBlcyA9IGRlY29kZV90eXBlc1t0eXBlc107fVxuXG4gICAgdGhpcy50eXBlc3RhY2sucHVzaCh0aGlzLnR5cGVzLCB0eXBlcyk7XG4gICAgdGhpcy50eXBlcyA9IHR5cGVzO31cblxuICBkZWNvZGVfdW5rbm93bihkZWNvZGVyLCB0eXBlX2IpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIENCT1IgZGVjb3JkZXIgcmVnZWlzdGVyZWQgZm9yICR7dHlwZV9ifSAoMHgkeygnMCcrdHlwZV9iLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpfSlgKSB9IH1cblxuXG5DQk9SRGVjb2RlckJhc2ljLnByb3RvdHlwZS5qbXAgPSBkZWNvZGVfYmFzaWNfanVtcCgpO1xuQ0JPUkRlY29kZXJCYXNpYy5wcm90b3R5cGUudHlwZXMgPSBkZWNvZGVfdHlwZXM7XG5cbmNvbnN0IENCT1JEZWNvZGVyID0gQ0JPUkRlY29kZXJCYXNpYztcblxuZXhwb3J0IGRlZmF1bHQgY2Jvcl91OF9kZWNvZGU7XG5leHBvcnQgeyBjYm9yX3U4X2RlY29kZSwgQ0JPUkRlY29kZXJCYXNpYywgQ0JPUkRlY29kZXIsIGRlY29kZV90eXBlcywgZGVjb2RlX2p1bXAsIGRlY29kZV9iYXNpY19qdW1wLCBjYm9yX2JyZWFrX3N5bSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2Jvcl9kZWNvZGUuanMubWFwXG4iLCJjb25zdCB7IGFzc2VydCB9ID0gcmVxdWlyZSgnY2hhaScpXG5cbmltcG9ydCB7IGhleF90b191OCB9IGZyb20gJ3U4LXV0aWxzL2VzbS9oZXgnXG4jSUYgUExBVF9OT0RFSlNcbiAgaW1wb3J0IHsgQ0JPUkRlY29kZXJCYXNpYyB9IGZyb20gJ2Nib3ItY29kZWMvZXNtL2Nib3JfZGVjb2RlLmpzJ1xuXG4jRUxJRiBQTEFUX1dFQlxuICBpbXBvcnQgeyBDQk9SRGVjb2RlckJhc2ljIH0gZnJvbSAnY2Jvci1jb2RlYy9lc20vd2ViL2Nib3JfZGVjb2RlLmpzJ1xuXG5cbmRlc2NyaWJlIEAgJ0RlY29kZSBDQk9SIFRhZ3MnLCBAPT4gOjpcbiAgaXQgQCAnVGFnIDAgLS0gU3RhbmRhcmQgZGF0ZS90aW1lIHN0cmluZzsgc2VlIFNlY3Rpb24gMi40LjEnLCBAPT4gOjpcbiAgICBjb25zdCBhbnMgPSBDQk9SRGVjb2RlckJhc2ljLmRlY29kZSBAIGhleF90b191OCBAXG4gICAgICAnYzAgNzQgMzIzMDMxMzMyZDMwMzMyZDMyMzE1NDMyMzAzYTMwMzQzYTMwMzA1YSdcblxuICAgIGFzc2VydC5lcXVhbCBAIGFucy50b0lTT1N0cmluZygpLCAnMjAxMy0wMy0yMVQyMDowNDowMC4wMDBaJ1xuXG4gIGl0IEAgJ1RhZyAxIC0tIEVwb2NoLWJhc2VkIGRhdGUvdGltZTsgc2VlIFNlY3Rpb24gMi40LjEnLCBAPT4gOjpcbiAgICBjb25zdCBhbnMgPSBDQk9SRGVjb2RlckJhc2ljLmRlY29kZSBAIGhleF90b191OCBAXG4gICAgICAnYzEgZmIgNDFkNDUyZDllYzIwMDAwMCdcblxuICAgIGFzc2VydC5lcXVhbCBAIGFucy50b0lTT1N0cmluZygpLCAnMjAxMy0wMy0yMVQyMDowNDowMC41MDBaJ1xuXG4gIGl0IEAgJ1RhZyAyNCAtLSBFbmNvZGVkIENCT1IgZGF0YSBpdGVtOyBzZWUgU2VjdGlvbiAyLjQuNC4xJywgQD0+IDo6XG4gICAgY29uc3QgdTggPSBDQk9SRGVjb2RlckJhc2ljLmRlY29kZSBAIGhleF90b191OCBAXG4gICAgICAnZDgxOCA0NTY0NDk0NTU0NDYnXG5cbiAgICBhc3NlcnQuZGVlcEVxdWFsIEAgQXJyYXkuZnJvbSh1OCksIFsgMTAwLCA3MywgNjksIDg0LCA3MCBdXG4gICAgYXNzZXJ0LmVxdWFsIEAgdHlwZW9mIHU4LmRlY29kZUNCT1IsICdmdW5jdGlvbidcblxuICAgIGNvbnN0IGFucyA9IHU4LmRlY29kZUNCT1IoKVxuICAgIGFzc2VydC5lcXVhbCBAIGFucywgJ0lFVEYnXG5cbiAgaXQgQCAnVGFnIDMyIC0tIFVSSTsgc2VlIFNlY3Rpb24gMi40LjQuMycsIEA9PiA6OlxuICAgIGNvbnN0IHVybCA9IENCT1JEZWNvZGVyQmFzaWMuZGVjb2RlIEAgaGV4X3RvX3U4IEBcbiAgICAgICdkODIwIDc2Njg3NDc0NzAzYTJmMmY3Nzc3NzcyZTY1Nzg2MTZkNzA2YzY1MmU2MzZmNmQnXG5cbiAgICBhc3NlcnQuZXF1YWwgQCB1cmwuaHJlZiwgJ2h0dHA6Ly93d3cuZXhhbXBsZS5jb20vJ1xuICAgIGFzc2VydC5lcXVhbCBAIHVybC5vcmlnaW4sICdodHRwOi8vd3d3LmV4YW1wbGUuY29tJ1xuICAgIGFzc2VydC5lcXVhbCBAIHVybC5wcm90b2NvbCwgJ2h0dHA6J1xuICAgIGFzc2VydC5lcXVhbCBAIHVybC5wYXRobmFtZSwgJy8nXG5cbiAgaXQgQCAnVGFnIDU1Nzk5IC0tIFNlbGYtZGVzY3JpYmUgQ0JPUjsgc2VlIFNlY3Rpb24gMi40LjUnLCBAPT4gOjpcbiAgICBjb25zdCBhbnMgPSBDQk9SRGVjb2RlckJhc2ljLmRlY29kZSBAIGhleF90b191OCBAXG4gICAgICAnRDkgRDlGNyA4MyAwMSAwMiAwMydcblxuICAgIGFzc2VydC5kZWVwRXF1YWwgQCBhbnMsIFsxLDIsM11cblxuICBpdCBAICdUYWcgMjU4IC0tIFNldHMgZm9yIENCT1InLCBAPT4gOjpcbiAgICBjb25zdCBzID0gQ0JPUkRlY29kZXJCYXNpYy5kZWNvZGUgQCBoZXhfdG9fdTggQFxuICAgICAgJ0Q5IDAxMDIgODMgMDEgMDIgMDMnXG5cbiAgICBhc3NlcnQuZXF1YWwgQCBzLmhhcygxKSwgdHJ1ZVxuICAgIGFzc2VydC5lcXVhbCBAIHMuaGFzKDIpLCB0cnVlXG4gICAgYXNzZXJ0LmVxdWFsIEAgcy5oYXMoMyksIHRydWVcblxuICAgIGFzc2VydC5lcXVhbCBAIHMuc2l6ZSwgM1xuICAgIGFzc2VydC5lcXVhbCBAIHMgaW5zdGFuY2VvZiBTZXQsIHRydWVcblxuIiwiZXhwb3J0IGRlZmF1bHQgQFtdXG4gIEB7fVxuICAgIGNib3I6IFwiQUE9PVwiXG4gICAgaGV4OiBcIjAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJBUT09XCJcbiAgICBoZXg6IFwiMDFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDFcblxuICBAe31cbiAgICBjYm9yOiBcIkNnPT1cIlxuICAgIGhleDogXCIwYVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTBcblxuICBAe31cbiAgICBjYm9yOiBcIkZ3PT1cIlxuICAgIGhleDogXCIxN1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMjNcblxuICBAe31cbiAgICBjYm9yOiBcIkdCZz1cIlxuICAgIGhleDogXCIxODE4XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAyNFxuXG4gIEB7fVxuICAgIGNib3I6IFwiR0JrPVwiXG4gICAgaGV4OiBcIjE4MTlcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDI1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJHR1E9XCJcbiAgICBoZXg6IFwiMTg2NFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHUVBvXCJcbiAgICBoZXg6IFwiMTkwM2U4XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxMDAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCJHZ0FQUWtBPVwiXG4gICAgaGV4OiBcIjFhMDAwZjQyNDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEwMDAwMDBcblxuICBAe31cbiAgICBjYm9yOiBcIkd3QUFBT2pVcFJBQVwiXG4gICAgaGV4OiBcIjFiMDAwMDAwZThkNGE1MTAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogMTAwMDAwMDAwMDAwMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiRy8vLy8vLy8vLy8vXCJcbiAgICBoZXg6IFwiMWJmZmZmZmZmZmZmZmZmZmZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxODQ0Njc0NDA3MzcwOTU1MTYxNVxuXG4gIEB7fVxuICAgIGVuYWJsZWQ6IGZhbHNlXG4gICAgY2JvcjogXCJ3a2tCQUFBQUFBQUFBQUE9XCJcbiAgICBoZXg6IFwiYzI0OTAxMDAwMDAwMDAwMDAwMDAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIyKGhcXCcwMTAwMDAwMDAwMDAwMDAwMDBcXCcpXCJcbiAgICBkZWNvZGVkOiAxODQ0Njc0NDA3MzcwOTU1MTYxNlxuXG4gIEB7fVxuICAgIGNib3I6IFwiTy8vLy8vLy8vLy8vXCJcbiAgICBoZXg6IFwiM2JmZmZmZmZmZmZmZmZmZmZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtMTg0NDY3NDQwNzM3MDk1NTE2MTZcblxuICBAe31cbiAgICBlbmFibGVkOiBmYWxzZVxuICAgIGNib3I6IFwidzBrQkFBQUFBQUFBQUFBPVwiXG4gICAgaGV4OiBcImMzNDkwMTAwMDAwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMyhoXFwnMDEwMDAwMDAwMDAwMDAwMDAwXFwnKVwiXG4gICAgZGVjb2RlZDogLTE4NDQ2NzQ0MDczNzA5NTUxNjE3XG5cbiAgQHt9XG4gICAgY2JvcjogXCJJQT09XCJcbiAgICBoZXg6IFwiMjBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0xXG5cbiAgQHt9XG4gICAgY2JvcjogXCJLUT09XCJcbiAgICBoZXg6IFwiMjlcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0xMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiT0dNPVwiXG4gICAgaGV4OiBcIjM4NjNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0xMDBcblxuICBAe31cbiAgICBjYm9yOiBcIk9RUG5cIlxuICAgIGhleDogXCIzOTAzZTdcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0xMDAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrUUFBXCJcbiAgICBoZXg6IFwiZjkwMDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAwLjBcblxuICBAe31cbiAgICBjYm9yOiBcIitZQUFcIlxuICAgIGhleDogXCJmOTgwMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IC0wLjBcblxuICBAe31cbiAgICBjYm9yOiBcIitUd0FcIlxuICAgIGhleDogXCJmOTNjMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEuMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK3oveG1abVptWm1hXCJcbiAgICBoZXg6IFwiZmIzZmYxOTk5OTk5OTk5OTlhXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxLjFcblxuICBAe31cbiAgICBjYm9yOiBcIitUNEFcIlxuICAgIGhleDogXCJmOTNlMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEuNVxuXG4gIEB7fVxuICAgIGNib3I6IFwiK1h2L1wiXG4gICAgaGV4OiBcImY5N2JmZlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogNjU1MDQuMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK2tmRFVBQT1cIlxuICAgIGhleDogXCJmYTQ3YzM1MDAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAxMDAwMDAuMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiK245Ly8vOD1cIlxuICAgIGhleDogXCJmYTdmN2ZmZmZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4XG5cbiAgQHt9XG4gICAgY2JvcjogXCIrMzQzNUR5SUFIV2NcIlxuICAgIGhleDogXCJmYjdlMzdlNDNjODgwMDc1OWNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDEuMGUrMzAwXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrUUFCXCJcbiAgICBoZXg6IFwiZjkwMDAxXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiA1Ljk2MDQ2NDQ3NzUzOTA2M2UtMDhcblxuICBAe31cbiAgICBjYm9yOiBcIitRUUFcIlxuICAgIGhleDogXCJmOTA0MDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IDYuMTAzNTE1NjI1ZS0wNVxuXG4gIEB7fVxuICAgIGNib3I6IFwiK2NRQVwiXG4gICAgaGV4OiBcImY5YzQwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogLTQuMFxuXG4gIEB7fVxuICAgIGNib3I6IFwiKzhBUVptWm1abVptXCJcbiAgICBoZXg6IFwiZmJjMDEwNjY2NjY2NjY2NjY2XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiAtNC4xXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrWHdBXCJcbiAgICBoZXg6IFwiZjk3YzAwXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcIkluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIitYNEFcIlxuICAgIGhleDogXCJmOTdlMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiTmFOXCJcblxuICBAe31cbiAgICBjYm9yOiBcIitmd0FcIlxuICAgIGhleDogXCJmOWZjMDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiLUluZmluaXR5XCJcblxuICBAe31cbiAgICBjYm9yOiBcIituK0FBQUE9XCJcbiAgICBoZXg6IFwiZmE3ZjgwMDAwMFwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRpYWdub3N0aWM6IFwiSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK24vQUFBQT1cIlxuICAgIGhleDogXCJmYTdmYzAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCJOYU5cIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiK3YrQUFBQT1cIlxuICAgIGhleDogXCJmYWZmODAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCItSW5maW5pdHlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiKzMvd0FBQUFBQUFBXCJcbiAgICBoZXg6IFwiZmI3ZmYwMDAwMDAwMDAwMDAwXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGlhZ25vc3RpYzogXCJJbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrMy80QUFBQUFBQUFcIlxuICAgIGhleDogXCJmYjdmZjgwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIk5hTlwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrLy93QUFBQUFBQUFcIlxuICAgIGhleDogXCJmYmZmZjAwMDAwMDAwMDAwMDBcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIi1JbmZpbml0eVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCI5QT09XCJcbiAgICBoZXg6IFwiZjRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IGZhbHNlXG5cbiAgQHt9XG4gICAgY2JvcjogXCI5UT09XCJcbiAgICBoZXg6IFwiZjVcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IHRydWVcblxuICBAe31cbiAgICBjYm9yOiBcIjlnPT1cIlxuICAgIGhleDogXCJmNlwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogbnVsbFxuXG4gIEB7fVxuICAgIGNib3I6IFwiOXc9PVwiXG4gICAgaGV4OiBcImY3XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcInVuZGVmaW5lZFwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCI4QT09XCJcbiAgICBoZXg6IFwiZjBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwic2ltcGxlKDE2KVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCIrQmc9XCJcbiAgICBoZXg6IFwiZjgxOFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJzaW1wbGUoMjQpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIitQOD1cIlxuICAgIGhleDogXCJmOGZmXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkaWFnbm9zdGljOiBcInNpbXBsZSgyNTUpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIndIUXlNREV6TFRBekxUSXhWREl3T2pBME9qQXdXZz09XCJcbiAgICBoZXg6IFwiYzA3NDMyMzAzMTMzMmQzMDMzMmQzMjMxNTQzMjMwM2EzMDM0M2EzMDMwNWFcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMChcXFwiMjAxMy0wMy0yMVQyMDowNDowMFpcXFwiKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJ3UnBSUzJld1wiXG4gICAgaGV4OiBcImMxMWE1MTRiNjdiMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIxKDEzNjM4OTYyNDApXCJcblxuICBAe31cbiAgICBjYm9yOiBcIndmdEIxRkxaN0NBQUFBPT1cIlxuICAgIGhleDogXCJjMWZiNDFkNDUyZDllYzIwMDAwMFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCIxKDEzNjM4OTYyNDAuNSlcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiMTBRQkFnTUVcIlxuICAgIGhleDogXCJkNzQ0MDEwMjAzMDRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMjMoaCcwMTAyMDMwNCcpXCJcblxuICBAe31cbiAgICBjYm9yOiBcIjJCaEZaRWxGVkVZPVwiXG4gICAgaGV4OiBcImQ4MTg0NTY0NDk0NTU0NDZcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMjQoaCc2NDQ5NDU1NDQ2JylcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiMkNCMmFIUjBjRG92TDNkM2R5NWxlR0Z0Y0d4bExtTnZiUT09XCJcbiAgICBoZXg6IFwiZDgyMDc2Njg3NDc0NzAzYTJmMmY3Nzc3NzcyZTY1Nzg2MTZkNzA2YzY1MmU2MzZmNmRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiMzIoXFxcImh0dHA6Ly93d3cuZXhhbXBsZS5jb21cXFwiKVwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJRQT09XCJcbiAgICBoZXg6IFwiNDBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRpYWdub3N0aWM6IFwiaCcnXCJcblxuICBAe31cbiAgICBjYm9yOiBcIlJBRUNBd1E9XCJcbiAgICBoZXg6IFwiNDQwMTAyMDMwNFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGlhZ25vc3RpYzogXCJoJzAxMDIwMzA0J1wiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZQT09XCJcbiAgICBoZXg6IFwiNjBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwiXCJcblxuICBAe31cbiAgICBjYm9yOiBcIllXRT1cIlxuICAgIGhleDogXCI2MTYxXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcImFcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWkVsRlZFWT1cIlxuICAgIGhleDogXCI2NDQ5NDU1NDQ2XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIklFVEZcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiWWlKY1wiXG4gICAgaGV4OiBcIjYyMjI1Y1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCJcXFwiXFxcXFwiXG5cbiAgQHt9XG4gICAgY2JvcjogXCJZc084XCJcbiAgICBoZXg6IFwiNjJjM2JjXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBcIsO8XCJcblxuICBAe31cbiAgICBjYm9yOiBcIlkrYXd0QT09XCJcbiAgICBoZXg6IFwiNjNlNmIwYjRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IFwi5rC0XCJcblxuICBAe31cbiAgICBjYm9yOiBcIlpQQ1FoWkU9XCJcbiAgICBoZXg6IFwiNjRmMDkwODU5MVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogXCLwkIWRXCJcblxuICBAe31cbiAgICBjYm9yOiBcImdBPT1cIlxuICAgIGhleDogXCI4MFwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogW11cblxuICBAe31cbiAgICBjYm9yOiBcImd3RUNBdz09XCJcbiAgICBoZXg6IFwiODMwMTAyMDNcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEBbXSAxLCAyLCAzXG5cbiAgQHt9XG4gICAgY2JvcjogXCJnd0dDQWdPQ0JBVT1cIlxuICAgIGhleDogXCI4MzAxODIwMjAzODIwNDA1XCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwibUJrQkFnTUVCUVlIQ0FrS0N3d05EZzhRRVJJVEZCVVdGeGdZR0JrPVwiXG4gICAgaGV4OiBcIjk4MTkwMTAyMDMwNDA1MDYwNzA4MDkwYTBiMGMwZDBlMGYxMDExMTIxMzE0MTUxNjE3MTgxODE4MTlcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsXG4gICAgICAxNywgMTgsIDE5LCAyMCwgMjEsIDIyLCAyMywgMjQsIDI1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJvQT09XCJcbiAgICBoZXg6IFwiYTBcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IEB7fVxuXG5cbiAgQHt9XG4gICAgY2JvcjogXCJvZ0VDQXdRPVwiXG4gICAgaGV4OiBcImEyMDEwMjAzMDRcIlxuICAgIHJvdW5kdHJpcDogdHJ1ZVxuICAgIGRlY29kZWQ6IHsxOiAyLCAzOiA0fVxuXG4gIEB7fVxuICAgIGNib3I6IFwib21GaEFXRmlnZ0lEXCJcbiAgICBoZXg6IFwiYTI2MTYxMDE2MTYyODIwMjAzXCJcbiAgICByb3VuZHRyaXA6IHRydWVcbiAgICBkZWNvZGVkOiBAe31cbiAgICAgIFwiYVwiOiAxXG4gICAgICBcImJcIjogQFtdXG4gICAgICAgIDJcbiAgICAgICAgM1xuXG4gIEB7fVxuICAgIGNib3I6IFwiZ21GaG9XRmlZV009XCJcbiAgICBoZXg6IFwiODI2MTYxYTE2MTYyNjE2M1wiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICBcImFcIlxuICAgICAgQHt9IFwiYlwiOiBcImNcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwicFdGaFlVRmhZbUZDWVdOaFEyRmtZVVJoWldGRlwiXG4gICAgaGV4OiBcImE1NjE2MTYxNDE2MTYyNjE0MjYxNjM2MTQzNjE2NDYxNDQ2MTY1NjE0NVwiXG4gICAgcm91bmR0cmlwOiB0cnVlXG4gICAgZGVjb2RlZDogQHt9XG4gICAgICBcImFcIjogXCJBXCJcbiAgICAgIFwiYlwiOiBcIkJcIlxuICAgICAgXCJjXCI6IFwiQ1wiXG4gICAgICBcImRcIjogXCJEXCJcbiAgICAgIFwiZVwiOiBcIkVcIlxuXG5cbiAgQHt9XG4gICAgY2JvcjogXCJYMElCQWtNREJBWC9cIlxuICAgIGhleDogXCI1ZjQyMDEwMjQzMDMwNDA1ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkaWFnbm9zdGljOiBcIihfIGgnMDEwMicsIGgnMDMwNDA1JylcIlxuXG4gIEB7fVxuICAgIGNib3I6IFwiZjJWemRISmxZV1J0YVc1bi93PT1cIlxuICAgIGhleDogXCI3ZjY1NzM3NDcyNjU2MTY0NmQ2OTZlNjdmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IFwic3RyZWFtaW5nXCJcblxuICBAe31cbiAgICBjYm9yOiBcIm4vOD1cIlxuICAgIGhleDogXCI5ZmZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogW11cblxuICBAe31cbiAgICBjYm9yOiBcIm53R0NBZ09mQkFYLy93PT1cIlxuICAgIGhleDogXCI5ZjAxODIwMjAzOWYwNDA1ZmZmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMVxuICAgICAgQFtdIDIsIDNcbiAgICAgIEBbXSA0LCA1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJud0dDQWdPQ0JBWC9cIlxuICAgIGhleDogXCI5ZjAxODIwMjAzODIwNDA1ZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAW11cbiAgICAgIDFcbiAgICAgIEBbXSAyLCAzXG4gICAgICBAW10gNCwgNVxuXG4gIEB7fVxuICAgIGNib3I6IFwiZ3dHQ0FnT2ZCQVgvXCJcbiAgICBoZXg6IFwiODMwMTgyMDIwMzlmMDQwNWZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQFtdXG4gICAgICAxXG4gICAgICBAW10gMiwgM1xuICAgICAgQFtdIDQsIDVcblxuICBAe31cbiAgICBjYm9yOiBcImd3R2ZBZ1AvZ2dRRlwiXG4gICAgaGV4OiBcIjgzMDE5ZjAyMDNmZjgyMDQwNVwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMVxuICAgICAgQFtdIDIsIDNcbiAgICAgIEBbXSA0LCA1XG5cbiAgQHt9XG4gICAgY2JvcjogXCJud0VDQXdRRkJnY0lDUW9MREEwT0R4QVJFaE1VRlJZWEdCZ1lHZjg9XCJcbiAgICBoZXg6IFwiOWYwMTAyMDMwNDA1MDYwNzA4MDkwYTBiMGMwZDBlMGYxMDExMTIxMzE0MTUxNjE3MTgxODE4MTlmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTZcbiAgICAgIDE3LCAxOCwgMTksIDIwLCAyMSwgMjIsIDIzLCAyNCwgMjVcblxuICBAe31cbiAgICBjYm9yOiBcInYyRmhBV0ZpbndJRC8vOD1cIlxuICAgIGhleDogXCJiZjYxNjEwMTYxNjI5ZjAyMDNmZmZmXCJcbiAgICByb3VuZHRyaXA6IGZhbHNlXG4gICAgZGVjb2RlZDogQHt9XG4gICAgICBcImFcIjogMVxuICAgICAgXCJiXCI6IEBbXSAyLCAzXG5cblxuICBAe31cbiAgICBjYm9yOiBcImdtRmh2MkZpWVdQL1wiXG4gICAgaGV4OiBcIjgyNjE2MWJmNjE2MjYxNjNmZlwiXG4gICAgcm91bmR0cmlwOiBmYWxzZVxuICAgIGRlY29kZWQ6IEBbXVxuICAgICAgXCJhXCJcbiAgICAgIEB7fSBcImJcIjogXCJjXCJcblxuICBAe31cbiAgICBjYm9yOiBcInYyTkdkVzcxWTBGdGRDSC9cIlxuICAgIGhleDogXCJiZjYzNDY3NTZlZjU2MzQxNmQ3NDIxZmZcIlxuICAgIHJvdW5kdHJpcDogZmFsc2VcbiAgICBkZWNvZGVkOiBAe31cbiAgICAgIFwiRnVuXCI6IHRydWVcbiAgICAgIFwiQW10XCI6IC0yXG4iLCIvLyBhbGdvcml0aG06IGZ0cDovL2Z0cC5mb3gtdG9vbGtpdC5vcmcvcHViL2Zhc3RoYWxmZmxvYXRjb252ZXJzaW9uLnBkZlxuXG5jb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoNCk7XG5jb25zdCBmbG9hdFZpZXcgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlcik7XG5jb25zdCB1aW50MzJWaWV3ID0gbmV3IFVpbnQzMkFycmF5KGJ1ZmZlcik7XG5cblxuY29uc3QgYmFzZVRhYmxlID0gbmV3IFVpbnQzMkFycmF5KDUxMik7XG5jb25zdCBzaGlmdFRhYmxlID0gbmV3IFVpbnQzMkFycmF5KDUxMik7XG5cbmZvcihsZXQgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIGNvbnN0IGUgPSBpIC0gMTI3O1xuXG4gICAgLy8gdmVyeSBzbWFsbCBudW1iZXIgKDAsIC0wKVxuICAgIGlmKGUgPCAtMjcpIHtcbiAgICAgICAgYmFzZVRhYmxlW2kgfCAweDAwMF0gPSAweDAwMDA7XG4gICAgICAgIGJhc2VUYWJsZVtpIHwgMHgxMDBdID0gMHg4MDAwO1xuICAgICAgICBzaGlmdFRhYmxlW2kgfCAweDAwMF0gPSAyNDtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgxMDBdID0gMjQ7XG5cbiAgICAvLyBzbWFsbCBudW1iZXIgKGRlbm9ybSlcbiAgICB9IGVsc2UgaWYoZSA8IC0xNCkge1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MDAwXSA9ICAweDA0MDAgPj4gKC1lIC0gMTQpO1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MTAwXSA9ICgweDA0MDAgPj4gKC1lIC0gMTQpKSB8IDB4ODAwMDtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgwMDBdID0gLWUgLSAxO1xuICAgICAgICBzaGlmdFRhYmxlW2kgfCAweDEwMF0gPSAtZSAtIDE7XG5cbiAgICAvLyBub3JtYWwgbnVtYmVyXG4gICAgfSBlbHNlIGlmKGUgPD0gMTUpIHtcbiAgICAgICAgYmFzZVRhYmxlW2kgfCAweDAwMF0gPSAgKGUgKyAxNSkgPDwgMTA7XG4gICAgICAgIGJhc2VUYWJsZVtpIHwgMHgxMDBdID0gKChlICsgMTUpIDw8IDEwKSB8IDB4ODAwMDtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgwMDBdID0gMTM7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MTAwXSA9IDEzO1xuXG4gICAgLy8gbGFyZ2UgbnVtYmVyIChJbmZpbml0eSwgLUluZmluaXR5KVxuICAgIH0gZWxzZSBpZihlIDwgMTI4KSB7XG4gICAgICAgIGJhc2VUYWJsZVtpIHwgMHgwMDBdID0gMHg3YzAwO1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MTAwXSA9IDB4ZmMwMDtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgwMDBdID0gMjQ7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MTAwXSA9IDI0O1xuXG4gICAgLy8gc3RheSAoTmFOLCBJbmZpbml0eSwgLUluZmluaXR5KVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGJhc2VUYWJsZVtpIHwgMHgwMDBdID0gMHg3YzAwO1xuICAgICAgICBiYXNlVGFibGVbaSB8IDB4MTAwXSA9IDB4ZmMwMDtcbiAgICAgICAgc2hpZnRUYWJsZVtpIHwgMHgwMDBdID0gMTM7XG4gICAgICAgIHNoaWZ0VGFibGVbaSB8IDB4MTAwXSA9IDEzO1xuICAgIH1cbn1cblxuLyoqXG4gKiByb3VuZCBhIG51bWJlciB0byBhIGhhbGYgZmxvYXQgbnVtYmVyIGJpdHMuXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtXG4gKi9cbmZ1bmN0aW9uIHJvdW5kVG9GbG9hdDE2Qml0cyhudW0pIHtcbiAgICBmbG9hdFZpZXdbMF0gPSBudW07XG5cbiAgICBjb25zdCBmID0gdWludDMyVmlld1swXTtcbiAgICBjb25zdCBlID0gKGYgPj4gMjMpICYgMHgxZmY7XG4gICAgcmV0dXJuIGJhc2VUYWJsZVtlXSArICgoZiAmIDB4MDA3ZmZmZmYpID4+IHNoaWZ0VGFibGVbZV0pO1xufVxuXG5cbmNvbnN0IG1hbnRpc3NhVGFibGUgPSBuZXcgVWludDMyQXJyYXkoMjA0OCk7XG5jb25zdCBleHBvbmVudFRhYmxlID0gbmV3IFVpbnQzMkFycmF5KDY0KTtcbmNvbnN0IG9mZnNldFRhYmxlID0gbmV3IFVpbnQzMkFycmF5KDY0KTtcblxubWFudGlzc2FUYWJsZVswXSA9IDA7XG5mb3IobGV0IGkgPSAxOyBpIDwgMTAyNDsgKytpKSB7XG4gICAgbGV0IG0gPSBpIDw8IDEzOyAgICAvLyB6ZXJvIHBhZCBtYW50aXNzYSBiaXRzXG4gICAgbGV0IGUgPSAwOyAgICAgICAgICAvLyB6ZXJvIGV4cG9uZW50XG5cbiAgICAvLyBub3JtYWxpemVkXG4gICAgd2hpbGUoKG0gJiAweDAwODAwMDAwKSA9PT0gMCkge1xuICAgICAgICBlIC09IDB4MDA4MDAwMDA7ICAgIC8vIGRlY3JlbWVudCBleHBvbmVudFxuICAgICAgICBtIDw8PSAxO1xuICAgIH1cblxuICAgIG0gJj0gfjB4MDA4MDAwMDA7ICAgLy8gY2xlYXIgbGVhZGluZyAxIGJpdFxuICAgIGUgKz0gMHgzODgwMDAwMDsgICAgLy8gYWRqdXN0IGJpYXNcblxuICAgIG1hbnRpc3NhVGFibGVbaV0gPSBtIHwgZTtcbn1cbmZvcihsZXQgaSA9IDEwMjQ7IGkgPCAyMDQ4OyArK2kpIHtcbiAgICBtYW50aXNzYVRhYmxlW2ldID0gMHgzODAwMDAwMCArICgoaSAtIDEwMjQpIDw8IDEzKTtcbn1cblxuZXhwb25lbnRUYWJsZVswXSA9IDA7XG5mb3IobGV0IGkgPSAxOyBpIDwgMzE7ICsraSkge1xuICAgIGV4cG9uZW50VGFibGVbaV0gPSBpIDw8IDIzO1xufVxuZXhwb25lbnRUYWJsZVszMV0gPSAweDQ3ODAwMDAwO1xuZXhwb25lbnRUYWJsZVszMl0gPSAweDgwMDAwMDAwO1xuZm9yKGxldCBpID0gMzM7IGkgPCA2MzsgKytpKSB7XG4gICAgZXhwb25lbnRUYWJsZVtpXSA9IDB4ODAwMDAwMDAgKyAoKGkgLSAzMikgPDwgMjMpO1xufVxuZXhwb25lbnRUYWJsZVs2M10gPSAweGM3ODAwMDAwO1xuXG5vZmZzZXRUYWJsZVswXSA9IDA7XG5mb3IobGV0IGkgPSAxOyBpIDwgNjQ7ICsraSkge1xuICAgIGlmKGkgPT09IDMyKSB7XG4gICAgICAgIG9mZnNldFRhYmxlW2ldID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvZmZzZXRUYWJsZVtpXSA9IDEwMjQ7XG4gICAgfVxufVxuXG4vKipcbiAqIGNvbnZlcnQgYSBoYWxmIGZsb2F0IG51bWJlciBiaXRzIHRvIGEgbnVtYmVyLlxuICogQHBhcmFtIHtudW1iZXJ9IGZsb2F0MTZiaXRzIC0gaGFsZiBmbG9hdCBudW1iZXIgYml0c1xuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9OdW1iZXIoZmxvYXQxNmJpdHMpIHtcbiAgICBjb25zdCBtID0gZmxvYXQxNmJpdHMgPj4gMTA7XG4gICAgdWludDMyVmlld1swXSA9IG1hbnRpc3NhVGFibGVbb2Zmc2V0VGFibGVbbV0gKyAoZmxvYXQxNmJpdHMgJiAweDNmZildICsgZXhwb25lbnRUYWJsZVttXTtcbiAgICByZXR1cm4gZmxvYXRWaWV3WzBdO1xufVxuXG5jb25zdCBoYWxmX2Zsb2F0ID0gZGVjb2RlX2hhbGZfZmxvYXQ7XG5mdW5jdGlvbiBkZWNvZGVfaGFsZl9mbG9hdCh1OCkge1xuICByZXR1cm4gY29udmVydFRvTnVtYmVyKCh1OFswXTw8OCkgfCB1OFsxXSkgfVxuXG5mdW5jdGlvbiBlbmNvZGVfaGFsZl9mbG9hdCh2YWx1ZSkge1xuICBjb25zdCB1MTYgPSByb3VuZFRvRmxvYXQxNkJpdHModmFsdWUpO1xuICByZXR1cm4gdTE2fVxuXG5leHBvcnQgZGVmYXVsdCBkZWNvZGVfaGFsZl9mbG9hdDtcbmV4cG9ydCB7IGhhbGZfZmxvYXQsIGRlY29kZV9oYWxmX2Zsb2F0LCBlbmNvZGVfaGFsZl9mbG9hdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGFsZl9mbG9hdC5qcy5tYXBcbiIsImNvbnN0IHsgYXNzZXJ0IH0gPSByZXF1aXJlKCdjaGFpJylcbmltcG9ydCB0ZXN0X3ZlY3RvcnMgZnJvbSAnLi9hcHBlbmRpeF9hLmpzeSdcblxuaW1wb3J0IHsgaGV4X3RvX3U4LCB1OF90b19oZXggfSBmcm9tICd1OC11dGlscy9lc20vaGV4J1xuaW1wb3J0IGhhbGZfZmxvYXQgZnJvbSAnY2Jvci1jb2RlYy9lc20vaGFsZl9mbG9hdC5qcydcblxuI0lGIFBMQVRfTk9ERUpTXG4gIGltcG9ydCB7IENCT1JEZWNvZGVyQmFzaWMgfSBmcm9tICdjYm9yLWNvZGVjL2VzbS9jYm9yX2RlY29kZS5qcydcblxuI0VMSUYgUExBVF9XRUJcbiAgaW1wb3J0IHsgQ0JPUkRlY29kZXJCYXNpYyB9IGZyb20gJ2Nib3ItY29kZWMvZXNtL3dlYi9jYm9yX2RlY29kZS5qcydcblxuXG5mdW5jdGlvbiB0YWdfYXNfZGlhZ25vc3RpYyhkZWNvZGVyLCB0YWcpIDo6XG4gIHJldHVybiB2ID0+IGAke3RhZ30oJHtKU09OLnN0cmluZ2lmeSh2KX0pYFxuXG5mdW5jdGlvbiB0YWdfYXNfaGV4X2RpYWdub3N0aWMoZGVjb2RlciwgdGFnKSA6OlxuICByZXR1cm4gdiA9PiBgJHt0YWd9KCR7dn0pYFxuXG5jb25zdCB0ZXN0aW5nX3RhZ3MgPSBuZXcgTWFwKClcbnRlc3RpbmdfdGFncy5zZXQgQCAwLCB0YWdfYXNfZGlhZ25vc3RpYyAvLyBTdGFuZGFyZCBkYXRlL3RpbWUgc3RyaW5nXG50ZXN0aW5nX3RhZ3Muc2V0IEAgMSwgdGFnX2FzX2RpYWdub3N0aWMgLy8gRXBvY2gtYmFzZWQgZGF0ZS90aW1lXG50ZXN0aW5nX3RhZ3Muc2V0IEAgMiwgdGFnX2FzX2hleF9kaWFnbm9zdGljIC8vIFBvc2l0aXZlIGJpZ251bVxudGVzdGluZ190YWdzLnNldCBAIDMsIHRhZ19hc19oZXhfZGlhZ25vc3RpYyAvLyBOZWdhdGl2ZSBiaWdudW1cbnRlc3RpbmdfdGFncy5zZXQgQCAyMywgdGFnX2FzX2hleF9kaWFnbm9zdGljIC8vIEV4cGVjdGVkIGNvbnZlcnNpb24gdG8gYmFzZTE2IGVuY29kaW5nXG50ZXN0aW5nX3RhZ3Muc2V0IEAgMjQsIHRhZ19hc19oZXhfZGlhZ25vc3RpYyAvLyBFbmNvZGVkIENCT1IgZGF0YSBpdGVtXG50ZXN0aW5nX3RhZ3Muc2V0IEAgMzIsIHRhZ19hc19kaWFnbm9zdGljIC8vIFVSSVxuXG5cbmNvbnN0IENCT1JEZWNvZGVyID0gQ0JPUkRlY29kZXJCYXNpYy5vcHRpb25zIEA6XG4gIHRhZ3M6IHRlc3RpbmdfdGFnc1xuICB0eXBlczogQHt9XG4gICAgaGFsZl9mbG9hdFxuICAgIGJ5dGVzKHU4KSA6OiByZXR1cm4gYGgnJHt1OF90b19oZXgodTgpfSdgXG4gICAgYnl0ZXNfc3RyZWFtKHU4KSA6OlxuICAgICAgbGV0IHJlcyA9IFtdXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRvbmUsIGksIGhfdTgpIDo6XG4gICAgICAgIGlmIGRvbmUgOjogcmV0dXJuIGAoXyAke3Jlcy5qb2luKCcsICcpfSlgXG4gICAgICAgIHJlcy5wdXNoKGhfdTgpXG5cbmRlc2NyaWJlIEAgJ0RlY29kZSBDQk9SIFRlc3QgVmVjdG9ycycsIEA9PiA6OlxuICBmb3IgY29uc3QgdGVzdCBvZiB0ZXN0X3ZlY3RvcnMgOjpcblxuICAgIGNvbnN0IGl0X2ZuID0gdGVzdC5za2lwID8gaXQuc2tpcCA6IHRlc3Qub25seSA/IGl0Lm9ubHkgOiBpdFxuICAgIGl0X2ZuIEAgYFwiJHt0ZXN0LmhleH1cIiB0byAke3Rlc3QuZGlhZ25vc3RpYyB8fCBKU09OLnN0cmluZ2lmeSh0ZXN0LmRlY29kZWQpfWAsIEA9PiA6OlxuICAgICAgY29uc3QgdTggPSBoZXhfdG9fdTggQCB0ZXN0LmhleFxuXG4gICAgICBjb25zdCBhbnMgPSBDQk9SRGVjb2Rlci5kZWNvZGUodTgpXG4gICAgICBpZiB0ZXN0LmRpYWdub3N0aWMgOjpcbiAgICAgICAgdHJ5IDo6XG4gICAgICAgICAgYXNzZXJ0LmVxdWFsIEAgdGVzdC5kaWFnbm9zdGljLCBhbnMrJydcbiAgICAgICAgY2F0Y2ggZXJyIDo6XG4gICAgICAgICAgY29uc29sZS5sb2cgQCMgJ2RpYWcnLCB0ZXN0LmRpYWdub3N0aWMsIGFuc1xuICAgICAgICAgIHRocm93IGVyclxuICAgICAgZWxzZSA6OlxuICAgICAgICB0cnkgOjpcbiAgICAgICAgICBhc3NlcnQuZGVlcEVxdWFsIEAgdGVzdC5kZWNvZGVkLCBhbnNcbiAgICAgICAgY2F0Y2ggZXJyIDo6XG4gICAgICAgICAgY29uc29sZS5sb2cgQCMgJ2RlY29kZScsIHRlc3QuZGVjb2RlZCwgYW5zXG4gICAgICAgICAgdGhyb3cgZXJyXG5cbiJdLCJuYW1lcyI6WyJoYWxmX2Zsb2F0IiwiYXNzZXJ0Il0sIm1hcHBpbmdzIjoiOzs7RUFBQTtJQUNFO01BQ0U7O0lBRUY7Z0RBQzRDLEdBQUc7Z0NBQ25CLEVBQUU7OztFQUdoQztJQUNFLGtCQUFrQixlQUFlLEVBQUUsRUFBRTtJQUNyQztJQUNBO01BQ0U7SUFDRjs7RUNkRjtJQUNFLHVCQUF1QixPQUFPOztFQUVoQztJQUNFO01BQ0U7SUFDRjtNQUNFO0lBQ0Y7TUFDRTtJQUNGOztFQUVGO0lBQ0U7SUFDQTtNQUNFO01BQ0EsS0FBSyxRQUFRO1FBQ1gsZ0JBQWdCLHlCQUF5QjtNQUMzQzs7SUFFRjtJQUNBO01BQ0U7TUFDQTtJQUNGOztFQUVGO0lBQ0U7O0VBRUY7O0VBRUE7RUFDQTtNQUNJO01BQ0E7UUFDRTtVQUNFO1VBQ0E7VUFDQTs7UUFFRjs7RUFFTjtFQUNBO01BQ0k7TUFDQTtRQUNFO1VBQ0UscUJBQXFCLEVBQUU7VUFDdkI7VUFDQTs7UUFFRjs7O0VBR047O0VBRUE7TUFDSTtNQUNBO1FBQ0U7UUFDQTs7RUFFTjtNQUNJO01BQ0E7UUFDRTtRQUNBOzs7RUFHTjs7RUFFQTtNQUNJO01BQ0E7UUFDRTtRQUNBOztFQUVOO01BQ0k7TUFDQTtRQUNFO1FBQ0E7OztFQUdOO01BQ0k7Ozs7O1FBS0U7UUFDQTtVQUNFO1VBQ0E7OztRQUdGO1FBQ0E7VUFDRTtVQUNBOzs7RUFHUjtNQUNJOzs7OztRQUtFO1FBQ0E7VUFDRTtVQUNBOzs7UUFHRjtRQUNBO1VBQ0U7VUFDQTs7RUFFUjtJQUNFOztJQUVBOztJQUVBO01BQ0U7TUFDQTs7TUFFQTtRQUNFOztNQUVGOzs7SUFHRjtNQUNFO01BQ0E7O01BRUE7UUFDRTs7TUFFRjtNQUNBO01BQ0E7TUFDQTs7SUFFRjs7O0VBR0Y7SUFDRTs7SUFFQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztJQUVBOztJQUVBO01BQ0U7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTs7SUFFRjtJQUNBO01BQ0U7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTs7O0lBR0Y7SUFDQTtJQUNBO0lBQ0E7Ozs7O0lBS0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7OztJQUlBOztJQUVBOzs7O0VBSUYsOEJBQThCLFlBQVk7OztFQUcxQztJQUNFO01BQ0U7O0VBRUo7SUFDRTtNQUNFO01BQ0E7TUFDQTtRQUNFOztFQUVOO0lBQ0U7TUFDRTtNQUNBO01BQ0E7UUFDRTs7RUFFTjtJQUNFO01BQ0U7TUFDQTtNQUNBO1FBQ0U7O0VBRU47SUFDRTtNQUNFO01BQ0E7O01BRUE7TUFDQTtNQUNBO01BQ0E7Ozs7O0VBS0o7SUFDRTs7RUFFRjtJQUNFOztFQUVGO0lBQ0U7SUFDQTtJQUNBO01BQ0U7O0VBRUo7SUFDRTtJQUNBO0lBQ0E7TUFDRTs7RUFFSjtJQUNFO01BQ0U7O0lBRUY7SUFDQTtNQUNFO0lBQ0Y7O0VBRUY7SUFDRTtNQUNFOztJQUVGO0lBQ0E7TUFDRTtNQUNBO01BQ0E7SUFDRjs7Ozs7RUFLRjtJQUNFO0lBQ0E7TUFDRTtNQUNBO1FBQ0U7TUFDRjs7RUFFSjtJQUNFO01BQ0U7TUFDQTtRQUNFO01BQ0Y7O0VBRUo7SUFDRTs7RUFFRjtJQUNFOztFQUVGO0lBQ0U7O0VBRUY7SUFDRTs7Ozs7RUFLRjtJQUNFO0lBQ0E7SUFDQTtNQUNFOztFQUVKO0lBQ0U7SUFDQTtJQUNBOztFQUVGO0lBQ0U7SUFDQTtJQUNBOzs7OztFQUtGO0lBQ0UsT0FBTyxVQUFVLElBQUksRUFBRTs7RUFFekI7SUFDRSxLQUFLLFVBQVU7TUFDYixvQkFBb0IsNkJBQTZCOztJQUVuRDtNQUNFOzs7OztFQUtKO0lBQ0UsS0FBSyxVQUFVO01BQ2Isb0JBQW9CLHFCQUFxQjs7SUFFM0M7TUFDRTtNQUNBO1FBQ0U7UUFDQTtRQUNBOztNQUVGOzs7RUFHSjs7O0lBR0U7OztJQUdBOztJQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF3QkE7TUFDRTs7O0lBR0Y7Ozs7Ozs7Ozs7Ozs7OztJQWVBOzs7Ozs7SUFNQSxnREFBZ0QsS0FBSzs7SUFFckQ7OztFQU1GO0lBQ0U7SUFDQTs7SUFFQTtNQUNFO01BQ0E7SUFDRjtNQUNFOztJQUVGO01BQ0U7O01BRUE7O01BRUE7TUFDQTs7TUFFQTtRQUNFO1FBQ0E7O1FBRUE7O01BRUY7O0lBRUY7TUFDRTs7TUFFQTtRQUNFOzs7TUFHRjs7TUFFQTtNQUNBO01BQ0E7O01BRUE7TUFDQTtRQUNFO1FBQ0E7VUFDRTs7UUFFRjtVQUNFOztRQUVGO1FBQ0E7UUFDQTs7SUFFSjs7SUFFQTtNQUNFO01BQ0E7UUFDRSxnQkFBZ0Isb0NBQW9DO01BQ3REOztJQUVGO01BQ0UsS0FBSyxRQUFRO1FBQ1g7O01BRUY7TUFDQTs7SUFFRjtNQUNFLGdCQUFnQixvQ0FBb0MsT0FBTyxNQUFNLENBQUMsR0FBRyxnQ0FBZ0MsRUFBRTs7O0VBRzNHO0VBQ0E7O0VDemZBLDJCQUEyQixNQUFNOzs7RUFVakMsU0FBVSxrQkFBbUI7SUFDM0IsR0FBSSx1REFBd0Q7TUFDMUQsb0NBQXFDO1FBQ25DOztNQUVGLGFBQWMsbUJBQW9COztJQUVwQyxHQUFJLG1EQUFvRDtNQUN0RCxvQ0FBcUM7UUFDbkM7O01BRUYsYUFBYyxtQkFBb0I7O0lBRXBDLEdBQUksdURBQXdEO01BQzFELG1DQUFvQztRQUNsQzs7TUFFRixpQkFBa0I7TUFDbEIsYUFBYyxzQkFBdUI7O01BRXJDO01BQ0EsYUFBYyxLQUFNOztJQUV0QixHQUFJLG9DQUFxQztNQUN2QyxvQ0FBcUM7UUFDbkM7O01BRUYsYUFBYyxVQUFXO01BQ3pCLGFBQWMsWUFBYTtNQUMzQixhQUFjLGNBQWU7TUFDN0IsYUFBYyxjQUFlOztJQUUvQixHQUFJLG9EQUFxRDtNQUN2RCxvQ0FBcUM7UUFDbkM7O01BRUYsaUJBQWtCOztJQUVwQixHQUFJLDBCQUEyQjtNQUM3QixrQ0FBbUM7UUFDakM7O01BRUYsYUFBYztNQUNkLGFBQWM7TUFDZCxhQUFjOztNQUVkLGFBQWM7TUFDZCxhQUFjOztBQ3pEbEI7O01BRUksTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBO01BQ0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7TUFDWjs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQTtNQUNBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZO01BQ1o7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTs7O01BR0EsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsWUFBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFlBQVk7OztNQUdaLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFNBQVM7OztNQUdULE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxTQUFTOzs7TUFHVCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBLFNBQVM7OztNQUdULE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxTQUFTOzs7TUFHVCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBWTs7O01BR1osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0U7U0FDRztTQUNBOzs7TUFHTCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtRQUNBOzs7TUFHRixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7Ozs7TUFJQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7OztNQUdBLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFLEdBQUc7UUFDSCxHQUFHO1VBQ0Q7VUFDQTs7O01BR0osTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0U7U0FDSSxHQUFHLEVBQUU7OztNQUdYLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFLEdBQUcsRUFBRTtRQUNMLEdBQUcsRUFBRTtRQUNMLEdBQUcsRUFBRTtRQUNMLEdBQUcsRUFBRTtRQUNMLEdBQUcsRUFBRTs7OztNQUlQLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQSxZQUFZOzs7TUFHWixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0EsU0FBUzs7O01BR1QsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBOzs7TUFHQSxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtTQUNHO1NBQ0E7OztNQUdMLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFO1NBQ0c7U0FDQTs7O01BR0wsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0U7U0FDRztTQUNBOzs7TUFHTCxNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtTQUNHO1NBQ0E7OztNQUdMLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFO1FBQ0E7OztNQUdGLE1BQU07TUFDTixLQUFLO01BQ0w7TUFDQTtRQUNFLEdBQUc7UUFDSCxHQUFHLEVBQUs7Ozs7TUFJVixNQUFNO01BQ04sS0FBSztNQUNMO01BQ0E7UUFDRTtTQUNJLEdBQUcsRUFBRTs7O01BR1gsTUFBTTtNQUNOLEtBQUs7TUFDTDtNQUNBO1FBQ0UsS0FBSztRQUNMLEtBQUs7Ozs7RUNwaEJYO0VBQ0E7RUFDQTs7O0VBR0E7RUFDQTs7RUFFQTtNQUNJOzs7TUFHQTtVQUNJO1VBQ0E7VUFDQTtVQUNBOzs7O1VBSUE7VUFDQTtVQUNBO1VBQ0E7Ozs7VUFJQTtVQUNBO1VBQ0E7VUFDQTs7OztVQUlBO1VBQ0E7VUFDQTtVQUNBOzs7O1VBSUE7VUFDQTtVQUNBO1VBQ0E7O0VBRVI7OztFQWVBO0VBQ0E7RUFDQTs7RUFFQTtFQUNBO01BQ0k7TUFDQTs7O01BR0E7VUFDSTtVQUNBOzs7TUFHSjtNQUNBOztNQUVBO0VBQ0o7RUFDQTtNQUNJO0VBQ0o7O0VBRUE7RUFDQTtNQUNJO0VBQ0o7RUFDQTtFQUNBO0VBQ0E7TUFDSTtFQUNKO0VBQ0E7O0VBRUE7RUFDQTtNQUNJO1VBQ0k7O1VBRUE7O0VBRVI7Ozs7OztFQU1BO01BQ0k7TUFDQTtNQUNBO0VBQ0o7RUFHQTtJQUNFOztFQ3ZIRixxQ0FBMkIsTUFBTTtBQUNqQzs7RUFZQTtJQUNFLFlBQVksR0FBRyxJQUFJLEdBQUcsa0JBQWtCOztFQUUxQztJQUNFLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRTs7RUFFMUI7RUFDQSxpQkFBa0I7RUFDbEIsaUJBQWtCO0VBQ2xCLGlCQUFrQjtFQUNsQixpQkFBa0I7RUFDbEIsaUJBQWtCO0VBQ2xCLGlCQUFrQjtFQUNsQixpQkFBa0I7OztFQUdsQjtJQUNFO0lBQ0E7a0JBQ0VBO01BQ0EsV0FBWSxPQUFRLEtBQUssY0FBYztNQUN2QztRQUNFO1FBQ0E7VUFDRSxJQUFFLE9BQVEsT0FBUSxNQUFNLFNBQVMsSUFBSSxFQUFFO1VBQ3ZDOztFQUVSLFNBQVUsMEJBQTJCO0lBQ25DLEtBQUc7O01BRUQ7TUFDQSxNQUFPLElBQUssU0FBUyxPQUFPLGdEQUFnRCxDQUFDO1FBQzNFLHFCQUFzQjs7UUFFdEI7UUFDQSxJQUFFO1VBQ0E7WUFDRUMsZUFBYyxxQkFBc0I7VUFDdEMsT0FBSztZQUNILGFBQWMsTUFBTztZQUNyQjs7VUFFRjtZQUNFQSxtQkFBa0I7VUFDcEIsT0FBSztZQUNILGFBQWMsUUFBUztZQUN2Qjs7OzsifQ==
