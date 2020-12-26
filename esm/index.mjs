const _lut_u8b2 = Array.from(Array(256),
  (_, v) => v.toString(2).padStart(8, '0'));

const _lut_u8hex = Array.from(Array(256),
  (_, v) => v.toString(16).padStart(2, '0'));

function u8_to_hex(u8, sep) {
  if (undefined === u8.buffer) {
    u8 = new Uint8Array(u8);}

  let s = '';
  sep = null==sep ? '' : ''+sep;

  // 20x faster than Array.from/.map impl
  for (const v of u8) {
    s += _lut_u8hex[v & 0xff];
    s += sep;}

  return sep.length ? s.slice(0, -sep.length) : s}


const _lut_hexu8 ={
  0: 0x0, 1: 0x1, 2: 0x2, 3: 0x3, 4: 0x4, 5: 0x5, 6: 0x6, 7: 0x7, 8: 0x8, 9: 0x9,
  a: 0xa, b: 0xb, c: 0xc, d: 0xd, e: 0xe, f: 0xf,
  A: 0xa, B: 0xb, C: 0xc, D: 0xd, E: 0xe, F: 0xf,};

function hex_to_u8(hex) {
  hex = hex.replace(/\W|_/g, '');
  if (1 & hex.length) {
    hex = '0'+hex; }// pad odd-length

  const len = hex.length >> 1, u8 = new Uint8Array(len);
  // ~55% faster than parseInt
  for (let i=0,j=0; i<len; j+=2) {
    u8[i++] = (_lut_hexu8[hex[j]] << 4) | _lut_hexu8[hex[j+1]];}
  return u8}

function u8_to_utf8(u8) {
  return new TextDecoder('utf-8').decode(u8) }

function utf8_to_u8(utf8) {
  return new TextEncoder('utf-8').encode(utf8) }

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
    if ('number' !== typeof byteLength) {
      throw new Error("Invalid part byteLength") }
    len += byteLength;}

  const u8 = new Uint8Array(len);
  for (const u8_part of parts) {
    u8.set(u8_part, i);
    i += u8_part.byteLength;}
  return u8}

const objIs = Object.is;
const _obj_kind_ = Function.call.bind(Object.prototype.toString);

function bind_encode_dispatch(ctx, api) {
  let simple_map, encode_object, lut_types;

  ctx.encode = encode;

  // rebind() binds the following: 
  //   - simple_map, encode_object, lut_types
  //   - '[object Object]' via lut_types.set @ _obj_kind_({}), encode_object
  api.rebind = rebind;
  return

  function rebind(host) {
    Object.defineProperties(ctx,{
      host: {value: host}} );

    simple_map = host._simple_map;
    lut_types = new Map(lut_common_types);

    for (const [k,fn] of host._encoder_map.entries()) {
      if ('string' === typeof k && 'function' === typeof fn) {
        lut_types.set(k, fn); } }

    if (host.bind_encode_object) {
      encode_object = host.bind_encode_object(ctx, lut_types);}

    else if (host.encode_object) {
      encode_object = host.encode_object;}

    if (encode_object) {
      lut_types.set(_obj_kind_({}), encode_object); }
    else encode_object = lut_types.get(_obj_kind_({})); }


  function encode(v) {
    const encoder = lut_types.get(_obj_kind_(v));
    if (undefined !== encoder) {
      encoder(v, ctx);
      return}

    // Lookup table for "simple" special instances
    if (undefined !== simple_map) {
      const simple = simple_map.get(v);
      if (undefined !== simple) {
        if (simple < 24) {
          ctx.add_w0(0xe0 | simple);}
        else if (simple <= 0xff) {
          ctx.add_w1(0xf8, simple);}
        else throw new Error(`Invalid simple value: ${simple}`)
        return} }

    // not '[object Object]', but also not handled explicitly. (e.g. [object Date])
    encode_object(v, ctx);
    return} }



const cu8_f32_nan = new Uint8Array([0xfa, 0x7f, 0xc0, 0, 0]);
const cu8_f32_neg_zero = new Uint8Array([0xfa, 0x80, 0, 0, 0]);
const lut_raw = bind_builtin_raw(new Map());

function bind_builtin_raw(lut_raw) {
  lut_raw.set(-0, cu8_f32_neg_zero);
  lut_raw.set(NaN, cu8_f32_nan);
  lut_raw.set(Infinity, new Uint8Array([0xfa, 0x7f, 0x80, 0, 0]));
  lut_raw.set(-Infinity, new Uint8Array([0xfa, 0xff, 0x80, 0, 0]));

  return lut_raw}

function encode_number(v, ctx) {
  if (! Number.isSafeInteger(v)) {
    const raw = lut_raw.get(v);
    if (undefined === raw) {
      // floating point or very large numbers
      ctx.float64(v);}

    else {
      ctx.raw_frame(raw);} }

  else if (v > 0) {
    // pos int
    ctx.add_int(0x00, v);}

  else if (v < 0) {
    // neg int
    ctx.add_int(0x20, -1 - v);}

  else if (objIs(-0, v)) {
    // negative zero; does not play well with identity or Map() lookup
    ctx.raw_frame(cu8_f32_neg_zero); }

  else {
    // int zero
    ctx.add_w0(0);} }


function useEncoderFor(lut_types, example, ...encoders) {
  for (const fn of encoders) {
    lut_types.set(_obj_kind_(example), fn); } }


const lut_common_types = bind_builtin_types(new Map());

function bind_builtin_types(lut_types) {
  useEncoderFor(lut_types, NaN, (v, ctx) => {ctx.raw_frame(cu8_f32_nan);} );
  useEncoderFor(lut_types, undefined, (v, ctx) => {ctx.add_w0(0xf7);} );
  useEncoderFor(lut_types, null, (v, ctx) => {ctx.add_w0(0xf6);} );
  useEncoderFor(lut_types, true, (v, ctx) => {ctx.add_w0(v ? 0xf5 : 0xf4);} );
  useEncoderFor(lut_types, 'utf8', (v, ctx) => {ctx.add_utf8(v);} );
  useEncoderFor(lut_types, 42, encode_number);
  useEncoderFor(lut_types, 42.1, encode_number);
  useEncoderFor(lut_types, [], (v, ctx) => {ctx.array(v);} );
  useEncoderFor(lut_types, {}, (v, ctx) => {ctx.object_pairs(v);} );

  useEncoderFor(lut_types, parseInt, (() => {} ) );
  useEncoderFor(lut_types, Symbol.iterator, (() => {} ) );


   {// ArrayBuffer and friends
    const ab = new ArrayBuffer(0);
    function encode_bytes(v, ctx) {ctx.add_bytes(v);}
    useEncoderFor(lut_types, ab, encode_bytes);

    for (const ArrayDataKlass of [
        Int8Array, Uint8Array, Uint8ClampedArray,
        Int16Array, Uint16Array, Int32Array, Uint32Array,
        Float32Array, Float64Array, DataView] ) {

      useEncoderFor(lut_types, new ArrayDataKlass(ab), encode_bytes); } }

  return lut_types}

const W1=24, W2=25, W4=26, W8=27; 

const sym_cbor = Symbol('cbor');

const ctx_prototype = bind_ctx_prototype();

function bind_ctx_prototype() {
  return {
    __proto__: null,

    // raw_frame, flush
    // add_w0, add_w1, add_int,
    // add_bytes, add_utf8, add_buffer,
    // float16_short, float32 float64

    tagEncode(tag, value) {
      const end_tag = this.tag(tag);
      this.encode(value);
      return end_tag()}

  , tag(tag, withTag) {
      if (true === tag) {tag = 0xd9f7;}
      this.add_int(0xc0, tag);
      return withTag || this.host.withTag(tag)}

  , bytes_stream(iterable) {
      const {add_w0, add_bytes} = this;
      add_w0(0x5f); // bytes stream
      for (const v of iterable) {
        add_bytes(v);}
      add_w0(0xff); }// break

  , utf8_stream(iterable) {
      const {add_w0, add_utf8} = this;
      add_w0(0x7f); // utf8 stream
      for (const v of iterable) {
        add_utf8(v);}
      add_w0(0xff); }// break


  , array(arr) {
      const {add_int, encode} = this;
      const len = arr.length;
      add_int(0x80, len);

      for (let i=0; i<len; i++) {
        encode(arr[i]);} }

  , list(iterable, count) {
      const {add_int, encode} = this;
      add_int(0x80, count);

      for (const v of iterable) {
        encode(v);

        if (0 >= count --) {
          break} } }

  , list_stream(iterable) {
      const {add_w0, encode} = this;
      add_w0(0x9f); // list stream

      for (const v of iterable) {
        encode(v);}

      add_w0(0xff); }// break


  , object_pairs(v) {
      if (undefined !== v[sym_cbor]) {
        return v[sym_cbor](ctx, v)}

      const {add_int, encode} = this;
      const ns = Object.entries(v);
      const count = ns.length;

      add_int(0xa0, count);
      for (let i=0; i<count; i++) {
        const e = ns[i];
        encode(e[0]);
        encode(e[1]);} }


  , pairs(iterable, count) {
      const {add_int, encode} = this;
      add_int(0xa0, count);

      for (const [k,v] of iterable) {
        encode(k);
        encode(v);

        if (0 >= count --) {
          break} } }

  , pair_stream(iterable) {
      const {add_w0, encode} = this;
      add_w0(0xbf); // map stream

      for (const [k,v] of iterable) {
        encode(k);
        encode(v);}

      add_w0(0xff); } } }// break



function bind_encoder_context(stream) {
  const blockSize = 65536;
  const u8_tip = new Uint8Array(blockSize);
  const dv_tip = new DataView(u8_tip.buffer);

  let idx_frame = 0, idx_next = 0;
  if (null == stream) {
    stream = u8concat_stream();}

  const ctx ={
    __proto__: ctx_prototype
  , raw_frame
  , flush

  , add_w0(bkind) {
      next_frame(bkind, 1);}

  , add_w1(bkind, v8) {
      u8_tip[ next_frame(bkind, 2) ] = v8;}

  , add_int
  , add_bytes
  , add_utf8
  , add_buffer

  , float16_short(u16) {
      dv_tip.setUint16(next_frame(0xf9, 3), v); }

  , float32(v) {
      dv_tip.setFloat32(next_frame(0xfa, 5), v); }

  , float64(v) {
      dv_tip.setFloat64(next_frame(0xfb, 9), v); } };


  bind_encode_dispatch(ctx, cbor_encode);
  return cbor_encode

  function cbor_encode(v, opt) {
    if (undefined === opt || null === opt) {
      ctx.encode(v);}
    else if (true === opt || 'number' === typeof opt) {
      ctx.tagEncode(opt, v);}
    else if (opt.tag) {
      ctx.tagEncode(opt.tag, v);}
    return ctx.flush()}


  function add_int(mask, v) {
    if (v <= 0xffff) {
      if (v < 24) {// tiny
        next_frame(mask | v, 1);}

      else if (v <= 0xff) {
        u8_tip[ next_frame(mask | W1, 2) ] = v;}

      else {
        dv_tip.setUint16(next_frame(mask | W2, 3), v); } }

    else if (v <= 0xffffffff) {
      dv_tip.setUint32(next_frame(mask | W4, 5), v); }

    else {
      const idx = next_frame(mask | W8, 9);

      const v_hi = (v / 0x100000000) | 0;
      dv_tip.setUint32(idx, v_hi);

      const v_lo = v & 0xffffffff;
      dv_tip.setUint32(4+idx, v_lo);
      return} }

  function add_bytes(v) {
    add_buffer(0x40, as_u8_buffer(v)); }

  function add_utf8(v) {
    add_buffer(0x60, utf8_to_u8(v)); }

  function add_buffer(mask, buf) {
    add_int(mask, buf.byteLength);
    raw_frame(buf);}


  // block paging

  function next_frame(bkind, frameWidth) {
    idx_frame = idx_next; idx_next += frameWidth;
    if (idx_next > blockSize) {
      stream.write(u8_tip.slice(0, idx_frame));
      idx_frame = 0;
      idx_next = frameWidth;}

    u8_tip[idx_frame] = bkind;
    return 1 + idx_frame}


  function raw_frame(buf) {
    const len = buf.byteLength;
    idx_frame = idx_next; idx_next += len;
    if (idx_next <= blockSize) {
      u8_tip.set(buf, idx_frame);
      return}

    if (0 !== idx_frame) {
      stream.write(u8_tip.slice(0, idx_frame)); }

    idx_frame = idx_next = 0;
    stream.write(buf); }


  function flush() {
    if (idx_next !== 0) {
      const blk = u8_tip.slice(0, idx_next);
      idx_frame = idx_next = 0;
      return stream.flush(blk)}
    else return stream.flush(null)} }



function u8concat_stream() {
  let blocks = [];
  return {
    write(blk) {blocks.push(blk);}
  , flush(blk) {
      if (0 === blocks.length) {
        return blk}

      if (null !== blk) {
        blocks.push(blk);}
      const u8 = u8_concat(blocks);
      blocks = [];
      return u8} } }

class CBOREncoderBasic {
  static create(stream) {return new this(stream)}
  static encode(v) {return new this().encode(v)}

  constructor(stream) {
    this.encode = bind_encoder_context(stream);
    this.rebind();}

  rebind() {
    this.encode.rebind(this);
    return this}

  withTag(tag) {return noop}

  encoder_map() {
    if (! Object.hasOwnProperty(this, '_encoder_map')) {
      this._encoder_map = new Map(this._encoder_map);
      this.rebind();}
    return this._encoder_map}

  simple_map() {
    if (! Object.hasOwnProperty(this, '_simple_map')) {
      this._simple_map = new Map(this._simple_map);
      this.rebind();}
    return this._simple_map} }


CBOREncoderBasic.prototype._encoder_map = new Map();
function noop() {}

class CBOREncoder extends CBOREncoderBasic {}

CBOREncoder.prototype._encoder_map = basic_tag_encoders(new Map());



function basic_tag_encoders(encoders) {
  // tag 1 -- Date
  useEncoderFor(encoders, new Date(), (v, ctx) => {
    const end_tag = ctx.tag(1);
    ctx.float64(v / 1000.);
    end_tag();} );

  // tag 32 -- URIs
  useEncoderFor(encoders, new URL('ws://h'), (v, ctx) => {
    const end_tag = ctx.tag(32);
    ctx.add_utf8(v.toString());
    end_tag();} );

  // tag 258 -- Sets (explicit type)
  useEncoderFor(encoders, new Set(), (v, ctx) => {
    const end_tag = ctx.tag(258);
    ctx.list(v, v.size);
    end_tag();} );

  // tag 259 -- Maps (explicit type)
  useEncoderFor(encoders, new Map(), (v, ctx) => {
    const end_tag = ctx.tag(259);
    ctx.pairs(v.entries(), v.size);
    end_tag();} );

  return encoders}

const encode = new CBOREncoder().encode;

const decode_types ={
  __proto__: null

, nestedCBOR(u8, ctx) {
    ctx = ctx.fromNestedU8(u8);
    u8.decodeCBOR = () => ctx.decode();
    return u8}

, float16(u8) {return u8}

, bytes(u8) {return u8}
, bytes_stream: build_Bytes

, utf8(u8) {return u8_to_utf8(u8)}
, utf8_stream: build_UTF8


, empty_list() {return []}
, list: build_Array
, list_stream: build_Array

, empty_map() {return {}}
, map: build_Obj
, map_stream: build_Obj};



function _withResultFn(res, fn, done) {
  fn = fn.bind(res);
  fn.done = done;
  fn.res = res;
  return fn}

function _obj_push(i, v) {this.push(v);}
function _bytes_done() {
  const res = this.res; this.res = null;
  return u8_concat(res)}

function build_Bytes(ctx) {
  return _withResultFn([], _obj_push, _bytes_done) }

function _utf8_done() {
  const res = this.res; this.res = null;
  return res.join('')}
function build_UTF8(ctx) {
  return _withResultFn([], _obj_push, _utf8_done) }



function _withResult(res, fn) {
  fn = fn.bind(res);
  fn.res = res;
  return fn}

function _obj_set(k, v) {this[k] = v;}

function build_Obj(ctx) {
  return _withResult({}, _obj_set) }

function build_Array(ctx, len) {
  const res = len ? new Array(len) : [];
  return _withResult(res, _obj_set) }


const decode_Map ={
  empty_map() {return new Map()}
, map: build_Map
, map_stream: build_Map};

function _map_set(k, v) {this.set(k, v);}
function build_Map(ctx) {
  return _withResult(new Map(), _map_set) }


const decode_Set ={
  empty_list() {return new Set()}
, list: build_Set
, list_stream: build_Set};

function _set_add(k, v) {this.add(v);}
function build_Set(ctx) {
  return _withResult(new Set(), _set_add) }

class U8DecodeCtx {

  static subclass(types, jmp, unknown) {
    class U8DecodeCtx_ extends this {}
    const nextValue = U8DecodeCtx_.bindNextValue(jmp, unknown);

    Object.assign(U8DecodeCtx_.prototype,{
      nextValue, decode_types: types, types} );
    return U8DecodeCtx_}


  static get fromU8() {
    const inst0 = new this();
    const inst0_types = inst0.decode_types;

    return (u8, types) => {
      u8 = as_u8_buffer(u8);
      const inst ={
        __proto__: inst0
      , idx: 0, u8
      , _popTypes: noop$1
      , _loc_proto_:{
          get u8() {return u8.slice(this.idx0, this.idx)} } };

      if (types !== inst0_types) {
        inst.decode_types = types;
        inst.types = types;}
      return inst} }

  static bindNextValue(jmp, unknown) {
    if (null == unknown) {
      unknown = error_unknown;}

    return function nextValue() {
      const doneTypes = this._popTypes();

      const type_b = this.u8[ this.idx ++ ];
      if (undefined === type_b) {
        this.idx--;
        throw cbor_done_sym}

      const decode = jmp[type_b] || unknown;
      const res = decode(this, type_b);

      return undefined === doneTypes
        ? res : doneTypes(res)} }

  fromNestedU8(u8) {
    return this.constructor.fromU8(u8, this.decode_types) }

  decode(inc_location) {
    try {
      if (inc_location) {
        const idx0 = this.idx || 0;
        const value = this.nextValue();
        const idx = this.idx;
        return {__proto__: this._loc_proto_, value, idx0, idx}}

      return this.nextValue()}
    catch (e) {
      if (cbor_done_sym === e) {
        e = new Error(`End of content`);
        e.cbor_partial ={
          __proto__: _loc_proto_,
          idx0, idx: this.idx, incomplete: true}; }
      throw e} }


  *iter_decode(inc_location) {
    let {_loc_proto_} = this;
    let idx0, idx = this.idx || 0;

    try {
      while (true) {
        idx0 = idx;
        const value = this.nextValue();
        idx = this.idx;

        yield inc_location
          ? { __proto__: _loc_proto_, idx0, idx, value }
          : value;} }

    catch (e) {
      if (cbor_done_sym === e) {
        idx = this.idx;
        if (idx0 == idx) {return}

        e = new Error(`End of partial frame`);
        e.cbor_partial ={
          __proto__: _loc_proto_,
          idx0, idx, incomplete: true}; }
      throw e} }

  pushTypes(overlay_types) {
    let {types, _popTypes} = this;

    if (noop$1 === _popTypes) {
      _popTypes = () => {
        this.types = types;}; }

    this._popTypes = (() => {
      this._popTypes = _popTypes;
      this.types = overlay_types;} );
    return types}

  move(byteWidth) {
    const idx0 = this.idx;
    const idx_next = idx0 + byteWidth;
    if (idx_next >= this.byteLength) {
      throw cbor_eoc_sym}
    this.idx = idx_next;
    return idx0} }


function noop$1() {}
function error_unknown(ctx, type_b) {
  throw new Error(`No CBOR decorder regeistered for ${type_b} (0x${('0'+type_b.toString(16)).slice(-2)})`) }


function decode_jump(options, jmp) {
  jmp = jmp ? jmp.slice() : decode_basic_jump( new Map() );

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


function decode_basic_jump(tags_lut) {
  const as_tag = bind_tag_dispatch(tags_lut || new Map());

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
  jmp[0x5f] = ctx => as_stream(ctx, ctx.types.bytes_stream(ctx));
  jmp[0x7f] = ctx => as_stream(ctx, ctx.types.utf8_stream(ctx));
  jmp[0x9f] = ctx => as_stream(ctx, ctx.types.list_stream(ctx));
  jmp[0xbf] = ctx => as_pair_stream(ctx, ctx.types.map_stream(ctx));

  // semantic tag

  // primitives
  jmp[0xf4] = function() {return false};
  jmp[0xf5] = function() {return true};
  jmp[0xf6] = function() {return null};
  jmp[0xf7] = function() {};// undefined
  jmp[0xf8] = _cbor_w1(simple_repr);
  jmp[0xf9] = float16;
  jmp[0xfa] = float32;
  jmp[0xfb] = float64;
  //jmp[0xfc] = undefined
  //jmp[0xfd] = undefined
  //jmp[0xfe] = undefined
  jmp[0xff] = function () {return cbor_break_sym};

  return jmp}


// special token
const cbor_break_sym = Symbol('CBOR-break');
const cbor_done_sym = Symbol('CBOR-done');
const cbor_eoc_sym = Symbol('CBOR-EOC');

// cbor size/value interpreters
function _cbor_tiny(as_type) {
  return function w0_as(ctx, type_b) {
    return as_type(ctx, type_b & 0x1f) } }

function _cbor_w1(as_type) {
  return function w1_as(ctx) {
    const idx = ctx.move(1);
    return as_type(ctx, ctx.u8[idx]) } }

function _cbor_w2(as_type) {
  return function w2_as(ctx) {
    const u8 = ctx.u8, idx = ctx.move(2);
    const v = (u8[idx] << 8) | u8[idx+1];
    return as_type(ctx, v) } }

function _cbor_w4(as_type) {
  return function w4_as(ctx) {
    const u8 = ctx.u8, idx = ctx.move(4);

    const v = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
    return as_type(ctx, (v >>> 0) ) } }// unsigned int32

function _cbor_w8(as_type) {
  return function (ctx) {
    const u8 = ctx.u8, idx = ctx.move(8);

    const v_hi = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
    const v_lo = (u8[idx+4] << 24) | (u8[idx+5] << 16) | (u8[idx+6] << 8) | u8[idx+7];
    const u64 = (v_lo >>> 0) + 0x100000000*(v_hi >>> 0);
    return as_type(ctx, u64) } }


// basic types

function as_pos_int(ctx, value) {
  return value}

function as_neg_int(ctx, value) {
  return -1 - value}

function as_bytes(ctx, len) {
  const u8 = ctx.u8, idx = ctx.move(len);
  return ctx.types.bytes(
    u8.subarray(idx, idx + len)) }

function as_utf8(ctx, len) {
  const u8 = ctx.u8, idx = ctx.move(len);
  return ctx.types.utf8(
    u8.subarray(idx, idx + len)) }

function as_list(ctx, len) {
  if (0 === len) {
    return ctx.types.empty_list()}

  const accum = ctx.types.list(len);
  for (let i=0; i<len; i++) {
    accum(i, ctx.nextValue()); }

  return undefined === accum.done ? accum.res : accum.done()}

function as_map(ctx, len) {
  if (0 === len) {
    return ctx.types.empty_map()}

  const accum = ctx.types.map(len);
  for (let i=0; i<len; i++) {
    const key = ctx.nextValue();
    const value = ctx.nextValue();
    accum(key, value); }

  return undefined === accum.done ? accum.res : accum.done()}


// streaming

function as_stream(ctx, accum) {
  let i = 0;
  while (true) {
    const value = ctx.nextValue();
    if (cbor_break_sym === value) {
      return undefined === accum.done ? accum.res : accum.done()}

    accum(i++, value); } }

function as_pair_stream(ctx, accum) {
  while (true) {
    const key = ctx.nextValue();
    if (cbor_break_sym === key) {
      return undefined === accum.done ? accum.res : accum.done()}

    accum(key, ctx.nextValue()); } }


// primitives

function float16(ctx) {
  const u8 = ctx.u8, idx = ctx.move(2);
  return ctx.types.float16(
    u8.subarray(idx, idx+2)) }

function float32(ctx) {
  const u8 = ctx.u8, idx = ctx.move(4);
  return new DataView(u8.buffer, idx, 4).getFloat32(0)}

function float64(ctx) {
  const u8 = ctx.u8, idx = ctx.move(8);
  return new DataView(u8.buffer, idx, 8).getFloat64(0)}


// simple values

function simple_repr(ctx, key) {
  return `simple(${key})`}

function bind_simple_dispatch(simple_lut) {
  if ('function' !== typeof simple_lut.get) {
    throw new TypeError('Expected a simple_value Map') }

  return function(ctx, key) {
    return simple_lut.get(key)} }


// tag values

function bind_tag_dispatch(tags_lut) {
  if ('function' !== typeof tags_lut.get) {
    throw new TypeError('Expected a tags Map') }

  return function(ctx, tag) {
    const tag_handler = tags_lut.get(tag);
    if (tag_handler) {
      const res = tag_handler(ctx, tag);
      const body = ctx.nextValue();
      return undefined === res ? body : res(body)}

    return {tag, body: ctx.nextValue()} } }

class CBORDecoderBasic {
  static decode(u8, opt) {return new this().decode(u8, opt)}
  static iter_decode(u8, opt) {return new this().iter_decode(u8, opt)}

  static options(options) {
    return (class extends this {}).compile(options)}

  static compile(options) {
    this.prototype.compile(options);
    return this}

  constructor(options) {
    if (null != options) {
      this.compile(options);}

    this.decode = (u8, opt) => this._ctxFromU8(u8, this.types).decode(opt);
    this.iter_decode = (u8, opt) => this._ctxFromU8(u8, this.types).iter_decode(opt);}

  compile(options) {
    this.jmp = decode_jump(options, this.jmp);

    if (options.types) {
      this.types = Object.assign(
        Object.create(this.types || null),
        options.types); }

    this._ctxFromU8 =
      (this.U8DecodeCtx || U8DecodeCtx)
        .subclass(this.types, this.jmp, options.unknown)
      .fromU8;

    return this} }

CBORDecoderBasic.compile({
  types: decode_types});

class CBORDecoder extends CBORDecoderBasic {}

CBORDecoder.compile({
  types: decode_types
, tags: basic_tags(new Map()) });


function basic_tags(tags_lut) {
  // from https://tools.ietf.org/html/rfc7049#section-2.4

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
  tags_lut.set(24, ctx => u8 => ctx.types.nestedCBOR(u8, ctx));

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
  tags_lut.set(258, ctx => {ctx.pushTypes(decode_Set);} );

  // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
  tags_lut.set(259, ctx => {ctx.pushTypes(decode_Map);} );

  return tags_lut}

const {decode, iter_decode} = new CBORDecoder();

export { CBORDecoder, CBORDecoderBasic, CBOREncoder, CBOREncoderBasic, U8DecodeCtx, as_u8_buffer, basic_tag_encoders, basic_tags, bind_builtin_types, bind_encode_dispatch, bind_encoder_context, cbor_break_sym, decode as cbor_decode, cbor_done_sym, encode as cbor_encode, cbor_eoc_sym, iter_decode as cbor_iter_decode, decode, decode_Map, decode_Set, decode_basic_jump, decode_jump, decode_types, encode, hex_to_u8, iter_decode, sym_cbor, u8_concat, u8_to_hex, u8_to_utf8, u8concat_stream, useEncoderFor, utf8_to_u8 };
//# sourceMappingURL=index.mjs.map
