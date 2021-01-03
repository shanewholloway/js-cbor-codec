(function () {
  'use strict';

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

  const _lut_u8b2$1 = Array.from(Array(256),
    (_, v) => v.toString(2).padStart(8, '0'));

  const _lut_u8hex$1 = Array.from(Array(256),
    (_, v) => v.toString(16).padStart(2, '0'));

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


  function use_encoder_for(lut_types, example, ...encoders) {
    for (const fn of encoders) {
      lut_types.set(_obj_kind_(example), fn); } }


  const lut_common_types = bind_builtin_types(new Map());

  function bind_builtin_types(lut_types) {
    use_encoder_for(lut_types, NaN, (v, ctx) => {ctx.raw_frame(cu8_f32_nan);} );
    use_encoder_for(lut_types, undefined, (v, ctx) => {ctx.add_w0(0xf7);} );
    use_encoder_for(lut_types, null, (v, ctx) => {ctx.add_w0(0xf6);} );
    use_encoder_for(lut_types, true, (v, ctx) => {ctx.add_w0(v ? 0xf5 : 0xf4);} );
    use_encoder_for(lut_types, 'utf8', (v, ctx) => {ctx.add_utf8(v);} );
    use_encoder_for(lut_types, 42, encode_number);
    use_encoder_for(lut_types, 42.1, encode_number);
    use_encoder_for(lut_types, [], (v, ctx) => {ctx.array(v);} );
    use_encoder_for(lut_types, {}, (v, ctx) => {ctx.object_pairs(v);} );

    use_encoder_for(lut_types, parseInt, (() => {} ) );
    use_encoder_for(lut_types, Symbol.iterator, (() => {} ) );


     {// ArrayBuffer and friends
      const ab = new ArrayBuffer(0);
      function encode_bytes(v, ctx) {ctx.add_bytes(v);}
      use_encoder_for(lut_types, ab, encode_bytes);

      for (const ArrayDataKlass of [
          Int8Array, Uint8Array, Uint8ClampedArray,
          Int16Array, Uint16Array, Int32Array, Uint32Array,
          Float32Array, Float64Array, DataView] ) {

        use_encoder_for(lut_types, new ArrayDataKlass(ab), encode_bytes); } }

    return lut_types}

  const W1=24, W2=25, W4=26, W8=27; 

  const sym_cbor = Symbol('cbor');

  const ctx_prototype = bind_ctx_prototype();

  function bind_ctx_prototype() {
    return {
      __proto__: null,

      // raw_frame,
      // add_w0, add_w1, add_int,
      // add_bytes, add_utf8, add_buffer,
      // float16_short, float32 float64

      tag_encode(tag, value) {
        const end_tag = this.tag(tag);
        this.encode(value);
        return end_tag()}

    , tag(tag, with_tag) {
        if (true === tag) {tag = 0xd9f7;}
        this.add_int(0xc0, tag);
        return with_tag || this.host.with_tag(tag)}

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
    let idx_frame = 0, idx_next = 0;
    if (null == stream) {
      stream = u8concat_outstream();}
    else if (!stream.flush && stream[Symbol.asyncIterator]) {
      stream = aiter_outstream(stream);}

    const block_size = stream.block_size || 65536;
    const u8_tip = new Uint8Array(block_size);
    const dv_tip = new DataView(u8_tip.buffer);

    const ctx ={
      __proto__: ctx_prototype
    , raw_frame

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
        ctx.tag_encode(opt, v);}
      else if (opt.tag) {
        ctx.tag_encode(opt.tag, v);}

      // flush complete cbor_encode op
      if (idx_next === 0) {
        return stream.flush(null)}

      const blk = u8_tip.slice(0, idx_next);
      idx_frame = idx_next = 0;
      return stream.flush(blk)}




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
      if (idx_next > block_size) {
        stream.write(u8_tip.slice(0, idx_frame));
        idx_frame = 0;
        idx_next = frameWidth;}

      u8_tip[idx_frame] = bkind;
      return 1 + idx_frame}


    function raw_frame(buf) {
      const len = buf.byteLength;
      idx_frame = idx_next; idx_next += len;
      if (idx_next <= block_size) {
        u8_tip.set(buf, idx_frame);
        return}

      if (0 !== idx_frame) {
        stream.write(u8_tip.slice(0, idx_frame)); }

      idx_frame = idx_next = 0;
      stream.write(buf); } }



  function u8concat_outstream() {
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


  function aiter_outstream(aiter_out) {
    let _x_tail;
    return {
      write(blk) {
        _x_tail = aiter_out.next(blk);}

    , async flush(blk) {
        let tail = (null !== blk)
          ? aiter_out.next(blk)
          : _x_tail;

        _x_tail = null;
        return await tail} } }

  class CBOREncoderBasic {
    static get create() {
      return stream => new this(stream)}
    static get encode() {
      return new this().encode}
    static get encode_stream() {
      return stream => new this(stream).encode}

    constructor(stream) {
      this.encode = bind_encoder_context(stream);
      this.rebind();}

    rebind() {
      this.encode.rebind(this);
      return this}

    with_tag(tag) {return noop}

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
    use_encoder_for(encoders, new Date(), (v, ctx) => {
      const end_tag = ctx.tag(1);
      ctx.float64(v / 1000.);
      end_tag();} );

    // tag 32 -- URIs
    use_encoder_for(encoders, new URL('ws://h'), (v, ctx) => {
      const end_tag = ctx.tag(32);
      ctx.add_utf8(v.toString());
      end_tag();} );

    // tag 258 -- Sets (explicit type)
    use_encoder_for(encoders, new Set(), (v, ctx) => {
      const end_tag = ctx.tag(258);
      ctx.list(v, v.size);
      end_tag();} );

    // tag 259 -- Maps (explicit type)
    use_encoder_for(encoders, new Map(), (v, ctx) => {
      const end_tag = ctx.tag(259);
      ctx.pairs(v.entries(), v.size);
      end_tag();} );

    return encoders}

  const _lut_u8b2$2 = Array.from(Array(256),
    (_, v) => v.toString(2).padStart(8, '0'));

  const _lut_u8hex$2 = Array.from(Array(256),
    (_, v) => v.toString(16).padStart(2, '0'));

  function u8_to_utf8(u8) {
    return new TextDecoder('utf-8').decode(u8) }

  function as_u8_buffer$1(u8) {
    



    if (u8 instanceof Uint8Array) {
      return u8}
    if (ArrayBuffer.isView(u8)) {
      return new Uint8Array(u8.buffer)}
    if (u8 instanceof ArrayBuffer) {
      return new Uint8Array(u8)}
    return Uint8Array.from(u8)}

  function u8_concat$1(parts) {
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

  const decode_types ={
    __proto__: null

  , nested_cbor(u8, ctx) {
      ctx = ctx.from_nested_u8(u8);
      u8.decode_cbor = () => ctx.decode_cbor();
      return u8}

  , u32(u8, idx) {
      const u32 = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
      return u32 >>> 0 }// unsigned int32

  , u64(u8, idx) {
      const v_hi = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
      const v_lo = (u8[idx+4] << 24) | (u8[idx+5] << 16) | (u8[idx+6] << 8) | u8[idx+7];
      const u64 = (v_lo >>> 0) + 0x100000000*(v_hi >>> 0);
      return u64}

  , float16(u8) {
      return {'@f2': u8}}
  , float32(u8, idx=u8.byteOffset) {
      return new DataView(u8.buffer, idx, 4).getFloat32(0)}
  , float64(u8, idx=u8.byteOffset) {
      return new DataView(u8.buffer, idx, 8).getFloat64(0)}

  , bytes(u8) {return u8}
  , bytes_stream: build_bytes

  , utf8(u8) {return u8_to_utf8(u8)}
  , utf8_stream: build_utf8


  , empty_list() {return []}
  , list: build_Array
  , list_stream: build_Array

  , empty_map() {return {}}
  , map: build_Obj
  , map_stream: build_Obj};



  function _with_result(res, fn, done) {
    fn = fn.bind(res);
    fn.res = res;
    if (undefined !== done) {
      fn.done = done;}
    return fn}

  function _obj_push(i, v) {this.push(v);}
  function _bytes_done() {
    const res = this.res; this.res = null;
    return u8_concat$1(res)}

  function build_bytes(ctx) {
    return _with_result([], _obj_push, _bytes_done) }

  function _utf8_done() {
    const res = this.res; this.res = null;
    return res.join('')}
  function build_utf8(ctx) {
    return _with_result([], _obj_push, _utf8_done) }



  function _obj_set(k, v) {this[k] = v;}

  function build_Obj(ctx) {
    return _with_result({}, _obj_set) }

  function build_Array(ctx, len) {
    const res = len ? new Array(len) : [];
    return _with_result(res, _obj_set) }


  const decode_Map ={
    empty_map: () => new Map()
  , map: build_Map
  , map_stream: build_Map};

  function _map_set(k, v) {this.set(k, v);}
  function build_Map(ctx) {
    return _with_result(new Map(), _map_set) }


  const decode_Set ={
    empty_list: () => new Set()
  , list: build_Set
  , list_stream: build_Set};

  function _set_add(k, v) {this.add(v);}
  function build_Set(ctx) {
    return _with_result(new Set(), _set_add) }

  class CBORDecoderBase {
    // Possible monkeypatch apis responsibilities:
    //   decode() ::
    //   *iter_decode() ::
    //   async decode_stream() ::
    //   async * aiter_decode_stream() ::

    static options(options) {
      return (class extends this {})
        .compile(options)}

    static compile(options) {
      this.prototype.compile(options);
      return this}

    constructor(options) {
      if (null != options) {
        this.compile(options);}

      this._U8Ctx_.bind_decode_api(this);}

    compile(options) {
      this.jmp = this._bind_cbor_jmp(options, this.jmp);

      if (options.types) {
        this.types = Object.assign(
          Object.create(this.types || null),
          options.types); }

      this._U8Ctx_ = this._bind_u8ctx(
        this.types, this.jmp, options.unknown);
      return this} }

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
    tags_lut.set(24, ctx => u8 => ctx.types.nested_cbor(u8, ctx));

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
    tags_lut.set(55799, () => {});


    // EXTENSIONS

    // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    tags_lut.set(258, ctx => { ctx.push_types(decode_Set); });

    // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    tags_lut.set(259, ctx => { ctx.push_types(decode_Map); });

    return tags_lut}

  // special token
  const cbor_break_sym = Symbol('CBOR-break');
  const cbor_done_sym = Symbol('CBOR-done');
  const cbor_eoc_sym = Symbol('CBOR-EOC');

  const _cbor_jmp_base ={
    bind_jmp(options, jmp) {
      jmp = jmp ? jmp.slice()
        : this.bind_basics_dispatch( new Map() );

      if (null == options) {
        options = {};}

      if (options.simple) {
        this.bind_jmp_simple(options, jmp);}

      if (options.tags) {
        this.bind_jmp_tag(options, jmp);}
      return jmp}

  , bind_jmp_simple(options, jmp) {
      if (options.simple) {
        const as_simple_value = this.bind_simple_dispatch(options.simple);
        const tiny_simple = this.cbor_tiny(as_simple_value);

        for (let i=0xe0; i<= 0xf3; i++) {
          jmp[i] = tiny_simple;}

        jmp[0xf8] = this.cbor_w1(as_simple_value);}
      return jmp}


  , bind_jmp_tag(options, jmp) {
      if (options.tags) {
        const as_tag = this.bind_tag_dispatch(options.tags);
        const tiny_tag = this.cbor_tiny(as_tag);

        for (let i=0xc0; i<= 0xd7; i++) {
          jmp[0xc0 | i] = tiny_tag;}

        jmp[0xd8] = this.cbor_w1(as_tag);
        jmp[0xd9] = this.cbor_w2(as_tag);
        jmp[0xda] = this.cbor_w4(as_tag);
        jmp[0xdb] = this.cbor_w8(as_tag);}

      return jmp}


  , bind_basics_dispatch(tags_lut) {
      const as_tag = this.bind_tag_dispatch(tags_lut || new Map());

      const tiny_pos_int = this.cbor_tiny(this.as_pos_int);
      const tiny_neg_int = this.cbor_tiny(this.as_neg_int);
      const tiny_bytes = this.cbor_tiny(this.as_bytes);
      const tiny_utf8 = this.cbor_tiny(this.as_utf8);
      const tiny_list = this.cbor_tiny(this.as_list);
      const tiny_map = this.cbor_tiny(this.as_map);
      const tiny_tag = this.cbor_tiny(this.as_tag);
      const tiny_simple_repr = this.cbor_tiny(this.as_simple_repr);

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


      const cbor_widths =[
        this.cbor_w1,
        this.cbor_w2,
        this.cbor_w4,
        this.cbor_w8];

      for (let w=0; w< 4; w++) {
        const i = 24+w, cbor_wN = cbor_widths[w];
        jmp[0x00 | i] = cbor_wN(this.as_pos_int);
        jmp[0x20 | i] = cbor_wN(this.as_neg_int);
        jmp[0x40 | i] = cbor_wN(this.as_bytes);
        jmp[0x60 | i] = cbor_wN(this.as_utf8);
        jmp[0x80 | i] = cbor_wN(this.as_list);
        jmp[0xa0 | i] = cbor_wN(this.as_map);
        jmp[0xc0 | i] = cbor_wN(this.as_tag);}


      // streaming data types
      jmp[0x5f] = ctx => this.as_stream(ctx, ctx.types.bytes_stream(ctx));
      jmp[0x7f] = ctx => this.as_stream(ctx, ctx.types.utf8_stream(ctx));
      jmp[0x9f] = ctx => this.as_stream(ctx, ctx.types.list_stream(ctx));
      jmp[0xbf] = ctx => this.as_pair_stream(ctx, ctx.types.map_stream(ctx));

      // semantic tag

      // primitives
      jmp[0xf4] = () => false;
      jmp[0xf5] = () => true;
      jmp[0xf6] = () => null;
      jmp[0xf7] = () => {}; // undefined
      jmp[0xf8] = this.cbor_w1(this.as_simple_repr);
      jmp[0xf9] = this.as_float16;
      jmp[0xfa] = this.as_float32;
      jmp[0xfb] = this.as_float64;
      //jmp[0xfc] = undefined
      //jmp[0xfd] = undefined
      //jmp[0xfe] = undefined
      jmp[0xff] = () => cbor_break_sym;

      return jmp}


  , // simple values

    as_pos_int: (ctx, value) => value,
    as_neg_int: (ctx, value) => -1 - value,
    as_simple_repr: (ctx, key) => `simple(${key})`,

    bind_simple_dispatch(simple_lut) {
      if ('function' !== typeof simple_lut.get) {
        throw new TypeError('Expected a simple_value Map') }

      return (ctx, key) => simple_lut.get(key)}



  , // Subclass responsibility: cbor size/value interpreters
    //   cbor_tiny(as_type) :: return function w0_as(ctx, type_b) ::
    //   cbor_w1(as_type) :: return function w1_as(ctx) ::
    //   cbor_w2(as_type) :: return function w2_as(ctx) ::
    //   cbor_w4(as_type) :: return function w4_as(ctx) ::
    //   cbor_w8(as_type) :: return function w8_as(ctx) ::

    // Subclass responsibility: basic types
    //   as_bytes(ctx, len) ::
    //   as_utf8(ctx, len) ::
    //   as_list(ctx, len) ::
    //   as_map(ctx, len) ::

    // Subclass responsibility: streaming types
    //   as_stream(ctx, accum) ::
    //   as_pair_stream(ctx, accum) ::

    // Subclass responsibility: floating point primitives
    //   as_float16(ctx) :: return ctx.types.float16(...)
    //   as_float32(ctx) ::
    //   as_float64(ctx) ::


    // Subclass responsibility: tag values
    };// bind_tag_dispatch(tags_lut) ::

  class U8DecodeBaseCtx {

    static subclass(types, jmp, unknown) {
      class U8DecodeCtx_ extends this {}
      let {prototype} = U8DecodeCtx_;
      prototype.next_value = U8DecodeCtx_.bind_next_value(jmp, unknown);
      prototype.types = types;
      return U8DecodeCtx_}


    from_nested_u8(u8) {
      return this.constructor
        .from_u8(u8, this.types)}


    push_types(overlay_types) {
      let {types, _pop_types, _pop_noop} = this;

      if (_pop_noop === _pop_types) {
        _pop_types = () => {
          this.types = types;}; }

      this._pop_types = (() => {
        this._pop_types = _pop_types;
        this.types = overlay_types;} );
      return types}

    _error_unknown(ctx, type_b) {
      throw new Error(`No CBOR decorder regeistered for ${type_b} (0x${('0'+type_b.toString(16)).slice(-2)})`) }

    _pop_noop() {}

    // Subclass responsibilities:
    //   static bind_decode_api(decoder)
    //   static bind_next_value(jmp, unknown) ::
    //   move(count_bytes) ::

    // Possible Subclass responsibilities:
    //   decode_cbor() ::
    //   *iter_decode_cbor() ::
    //   async decode_cbor() ::
    }//   async * aiter_decode_cbor() ::

  class U8SyncDecodeCtx extends U8DecodeBaseCtx {
    static bind_decode_api(decoder) {
      decoder.decode = u8 =>
        this.from_u8(u8, decoder.types)
          .decode_cbor();

      decoder.iter_decode = u8 =>
        this.from_u8(u8, decoder.types)
          .iter_decode_cbor();}


    static get from_u8() {
      const inst0 = new this();

      return (u8, types) => {
        u8 = as_u8_buffer$1(u8);
        const inst ={
          __proto__: inst0
        , idx: 0, u8
        , _pop_types: inst0._pop_noop};

        if (types && types !== inst0.types) {
          inst.types = types;}
        return inst} }


    static bind_next_value(jmp, unknown) {
      if (null == unknown) {
        unknown = this._error_unknown;}

      return function next_value() {
        const doneTypes = this._pop_types();

        const type_b = this.u8[ this.idx ++ ];
        if (undefined === type_b) {
          this.idx--;
          throw cbor_done_sym}

        const decode = jmp[type_b] || unknown;
        const res = decode(this, type_b);

        return undefined === doneTypes
          ? res : doneTypes(res)} }


    decode_cbor() {
      try {
        return this.next_value()}
      catch (e) {
        throw cbor_done_sym !== e ? e
          : new Error(`End of content`) } }


    *iter_decode_cbor() {
      try {
        while (1) {
          yield this.next_value();} }
      catch (e) {
        if (cbor_done_sym !== e) {
          throw e} } }


    move(count_bytes) {
      const {idx, byteLength} = this;
      const idx_next = idx + count_bytes;
      if (idx_next >= byteLength) {
        throw cbor_eoc_sym}
      this.idx = idx_next;
      return idx} }

  const _cbor_jmp_sync ={
    __proto__: _cbor_jmp_base

  , // cbor size/value interpreters
    cbor_tiny(as_type) {
      return function w0_as(ctx, type_b) {
        return as_type(ctx, type_b & 0x1f) } }

  , cbor_w1(as_type) {
      return function w1_as(ctx) {
        const idx = ctx.move(1);
        return as_type(ctx, ctx.u8[idx]) } }

  , cbor_w2(as_type) {
      return function w2_as(ctx) {
        const u8 = ctx.u8, idx = ctx.move(2);
        return as_type(ctx, (u8[idx] << 8) | u8[idx+1]) } }

  , cbor_w4(as_type) {
      return function w4_as(ctx) {
        const u8 = ctx.u8, idx = ctx.move(4);
        return as_type(ctx, ctx.types.u32(u8, idx)) } }

  , cbor_w8(as_type) {
      return function w8_as(ctx) {
        const u8 = ctx.u8, idx = ctx.move(8);
        return as_type(ctx, ctx.types.u64(u8, idx)) } }


  , // basic types

    as_bytes(ctx, len) {
      const u8 = ctx.u8, idx = ctx.move(len);
      return ctx.types.bytes(
        u8.subarray(idx, idx + len)) }

  , as_utf8(ctx, len) {
      const u8 = ctx.u8, idx = ctx.move(len);
      return ctx.types.utf8(
        u8.subarray(idx, idx + len)) }

  , as_list(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_list()}

      const accum = ctx.types.list(len);
      for (let i=0; i<len; i++) {
        accum(i, ctx.next_value()); }

      return undefined === accum.done ? accum.res : accum.done()}

  , as_map(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_map()}

      const accum = ctx.types.map(len);
      for (let i=0; i<len; i++) {
        const key = ctx.next_value();
        const value = ctx.next_value();
        accum(key, value); }

      return undefined === accum.done ? accum.res : accum.done()}


  , // streaming

    as_stream(ctx, accum) {
      let i = 0;
      while (true) {
        const value = ctx.next_value();
        if (cbor_break_sym === value) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(i++, value); } }

  , as_pair_stream(ctx, accum) {
      while (true) {
        const key = ctx.next_value();
        if (cbor_break_sym === key) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(key, ctx.next_value()); } }


  , // floating point primitives

    as_float16(ctx) {
      const u8 = ctx.u8, idx = ctx.move(2);
      return ctx.types.float16(
        u8.subarray(idx, idx+2)) }

  , as_float32(ctx) {
      const u8 = ctx.u8, idx = ctx.move(4);
      return ctx.types.float32(u8, idx)}

  , as_float64(ctx) {
      const u8 = ctx.u8, idx = ctx.move(8);
      return ctx.types.float64(u8, idx)}


  , // tag values

    bind_tag_dispatch(tags_lut) {
      if ('function' !== typeof tags_lut.get) {
        throw new TypeError('Expected a tags Map') }

      return function(ctx, tag) {
        const tag_handler = tags_lut.get(tag);
        if (tag_handler) {
          const res = tag_handler(ctx, tag);
          const body = ctx.next_value();
          return undefined === res ? body : res(body)}

        return { tag, body: ctx.next_value() }} } };

  class CBORDecoderBasic extends CBORDecoderBase {
    // decode(u8, opt) ::
    static decode(u8, opt) {
      return new this().decode(u8, opt)}

    // *iter_decode(u8, opt) ::
    static iter_decode(u8, opt) {
      return new this().iter_decode(u8, opt)}

    _bind_cbor_jmp(options, jmp) {
      return _cbor_jmp_sync.bind_jmp(options, jmp)}

    _bind_u8ctx(types, jmp, unknown) {
      return (this.U8DecodeCtx || U8SyncDecodeCtx)
        .subclass(types, jmp, unknown)} }

  CBORDecoderBasic.compile({
    types: decode_types});


  class CBORDecoder extends CBORDecoderBasic {}

  CBORDecoder.compile({
    types: decode_types,
    tags: basic_tags(new Map()),});

  const {decode, iter_decode} = new CBORDecoder();

  const { assert } = require('chai');


  describe('Encode ArrayBuffers and TypedArrays', (() => {
    it('ArrayBuffer', (() => {
      const ab = new ArrayBuffer(4 + 8 + 4);
      const u8 = CBOREncoder.encode(ab);
      assert.equal(u8_to_hex(u8), '5000000000000000000000000000000000');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Uint8Array);
      assert.deepEqual(u8_to_hex(rt), u8_to_hex(new Uint8Array(ab) )); } ) );

    it('Uint8Array', (() => {
      const buf = Uint8Array.from([10, 20, 30, 40, 50, 60]);
      const u8 = CBOREncoder.encode(buf);
      assert.equal(u8_to_hex(u8), '460a141e28323c');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Uint8Array);
      assert.deepEqual(u8_to_hex(rt), u8_to_hex(new Uint8Array(buf.buffer) )); } ) );

    it('Int8Array', (() => {
      const buf = Int8Array.from([-10, 20, -30, 40, -50, 60]);
      const u8 = CBOREncoder.encode(buf);
      assert.equal(u8_to_hex(u8), '46f614e228ce3c');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Uint8Array);
      assert.deepEqual(u8_to_hex(rt), u8_to_hex(new Uint8Array(buf.buffer) )); } ) );



    const is_big_endian = 0xab === new Uint8Array(new Uint16Array([0xab12]))[0];
    if (is_big_endian) {return}

    it('DataView', (() => {
      const dv = new DataView(new ArrayBuffer(4 + 8 + 4));
      dv.setFloat32(0, -Infinity);
      dv.setFloat64(4, 1e-150);
      dv.setUint32(12, 0xc0ffee);

      const u8 = CBOREncoder.encode(dv);
      assert.equal(u8_to_hex(u8), '50ff80000020ca2fe76a3f947500c0ffee');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Uint8Array);
      assert.deepEqual(u8_to_hex(rt), u8_to_hex(new Uint8Array(dv.buffer) )); } ) );

    it('Float32Array', (() => {
      const buf = Float32Array.from([-Infinity, -3e20, -1e-5, -0.0, NaN, 0.0, 1e-5, 3e20, Infinity]);
      const u8 = CBOREncoder.encode(buf);
      assert.equal(u8_to_hex(u8), '5824000080ffb11a82e1acc527b7000000800000c07f00000000acc52737b11a82610000807f');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Uint8Array);
      assert.deepEqual(u8_to_hex(rt), u8_to_hex(new Uint8Array(buf.buffer) )); } ) );

    it('Float64Array', (() => {
      const buf = Float64Array.from([-Infinity, -3e200, -1e-50, -0.0, NaN, 0.0, 1e-50, 3e200, Infinity]);
      const u8 = CBOREncoder.encode(buf);
      assert.equal(u8_to_hex(u8), '5848000000000000f0ff8713c343a55a8fe91fb8d44a7aee8db50000000000000080000000000000f87f00000000000000001fb8d44a7aee8d358713c343a55a8f69000000000000f07f');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Uint8Array);
      assert.deepEqual(u8_to_hex(rt), u8_to_hex(new Uint8Array(buf.buffer) )); } ) ); } ) );


  describe('Encode CBOR Tags', (() => {
    it('Tag 1 -- Epoch-based date/time; see Section 2.4.1', (() => {
      const v = new Date('2013-03-21T20:04:00.500Z');
      const u8 = CBOREncoder.encode(v);

      assert.equal(u8_to_hex(u8), 'c1fb41d452d9ec200000');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Date, 'Not a Date instance');
      assert.equal(+v, +rt); } ) );

    it('Tag 32 -- URI; see Section 2.4.4.3', (() => {
      const v = new URL('http://example.com/p?q=a');
      const u8 = CBOREncoder.encode(v);

      assert.equal(u8_to_hex(u8), 'd8207818687474703a2f2f6578616d706c652e636f6d2f703f713d61');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof URL, 'Not a URL instance');
      assert.equal(v.toString(), rt.toString()); } ) );

    it('Tag 55799 -- Self-describe CBOR; see Section 2.4.5', (() => {
      const v =[1, 2, 3];
      const u8 = new CBOREncoder().encode(v,{tag: true});

      assert.equal(u8_to_hex(u8), 'd9d9f783010203');

      const rt = CBORDecoder.decode(u8);
      assert.deepEqual(rt, v); } ) );

    it('Tag 258 -- Sets for CBOR', (() => {
      const v = new Set([1, 2, 3]);
      const u8 = CBOREncoder.encode(v);

      assert.equal(u8_to_hex(u8), 'd9010283010203');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Set, 'Not a Set instance');
      assert.deepEqual(rt, v); } ) );

    it('Tag 259 -- Explicit Maps for CBOR -- mixed keys', (() => {
      const v = new Map([
        [1942, 'v1']
      , ['k2', 'v2']
      , [[1,2,3], 'v3'] ]);

      const u8 = CBOREncoder.encode(v);

      assert.equal(u8_to_hex(u8), 'd90103a3190796627631626b3262763283010203627633');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Map, 'Not a Map instance');
      assert.equal(rt.size, 3);
      assert.equal(rt.get(1942), 'v1');
      assert.equal(rt.get('k2'), 'v2');
      assert.deepEqual(Array.from(rt.entries()).sort(), Array.from(v.entries()).sort()); } ) );

    it('Tag 259 -- Explicit Maps for CBOR -- all string keys', (() => {
      const v = new Map([
        ['k1', 'v1']
      , ['k2', 'v2'] ]);

      const u8 = CBOREncoder.encode(v);

      assert.equal(u8_to_hex(u8), 'd90103a2626b31627631626b32627632');

      const rt = CBORDecoder.decode(u8);
      assert.ok(rt instanceof Map, 'Not a Map instance');
      assert.equal(rt.size, 2);
      assert.equal(rt.get('k1'), 'v1');
      assert.equal(rt.get('k2'), 'v2');
      assert.deepEqual(Array.from(rt.entries()).sort(), Array.from(v.entries()).sort()); } ) ); } ) );

  var test_vectors_base = [
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
    , roundtrip: false
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
    , roundtrip: false
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
      cbor: "+z/xmZmZmZma"
    , hex: "fb3ff199999999999a"
    , roundtrip: true
    , decoded: 1.1}

  , {
      cbor: "+3435DyIAHWc"
    , hex: "fb7e37e43c8800759c"
    , roundtrip: true
    , decoded: 1.0e+300}

  , {
      cbor: "+8AQZmZmZmZm"
    , hex: "fbc010666666666666"
    , roundtrip: true
    , decoded: -4.1}

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
    , roundtrip: false
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

  const _lut_u8b2$3 = Array.from(Array(256),
    (_, v) => v.toString(2).padStart(8, '0'));

  const _lut_u8hex$3 = Array.from(Array(256),
    (_, v) => v.toString(16).padStart(2, '0'));

  function utf8_to_u8$1(utf8) {
    return new TextEncoder('utf-8').encode(utf8) }

  function as_u8_buffer$2(u8) {
    



    if (u8 instanceof Uint8Array) {
      return u8}
    if (ArrayBuffer.isView(u8)) {
      return new Uint8Array(u8.buffer)}
    if (u8 instanceof ArrayBuffer) {
      return new Uint8Array(u8)}
    return Uint8Array.from(u8)}

  function u8_concat$2(parts) {
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

  const objIs$1 = Object.is;
  const _obj_kind_$1 = Function.call.bind(Object.prototype.toString);

  function bind_encode_dispatch$1(ctx, api) {
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
      lut_types = new Map(lut_common_types$1);

      for (const [k,fn] of host._encoder_map.entries()) {
        if ('string' === typeof k && 'function' === typeof fn) {
          lut_types.set(k, fn); } }

      if (host.bind_encode_object) {
        encode_object = host.bind_encode_object(ctx, lut_types);}

      else if (host.encode_object) {
        encode_object = host.encode_object;}

      if (encode_object) {
        lut_types.set(_obj_kind_$1({}), encode_object); }
      else encode_object = lut_types.get(_obj_kind_$1({})); }


    function encode(v) {
      const encoder = lut_types.get(_obj_kind_$1(v));
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



  const cu8_f32_nan$1 = new Uint8Array([0xfa, 0x7f, 0xc0, 0, 0]);
  const cu8_f32_neg_zero$1 = new Uint8Array([0xfa, 0x80, 0, 0, 0]);
  const lut_raw$1 = bind_builtin_raw$1(new Map());

  function bind_builtin_raw$1(lut_raw) {
    lut_raw.set(-0, cu8_f32_neg_zero$1);
    lut_raw.set(NaN, cu8_f32_nan$1);
    lut_raw.set(Infinity, new Uint8Array([0xfa, 0x7f, 0x80, 0, 0]));
    lut_raw.set(-Infinity, new Uint8Array([0xfa, 0xff, 0x80, 0, 0]));

    return lut_raw}

  function encode_number$1(v, ctx) {
    if (! Number.isSafeInteger(v)) {
      const raw = lut_raw$1.get(v);
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

    else if (objIs$1(-0, v)) {
      // negative zero; does not play well with identity or Map() lookup
      ctx.raw_frame(cu8_f32_neg_zero$1); }

    else {
      // int zero
      ctx.add_w0(0);} }


  function use_encoder_for$1(lut_types, example, ...encoders) {
    for (const fn of encoders) {
      lut_types.set(_obj_kind_$1(example), fn); } }


  const lut_common_types$1 = bind_builtin_types$1(new Map());

  function bind_builtin_types$1(lut_types) {
    use_encoder_for$1(lut_types, NaN, (v, ctx) => {ctx.raw_frame(cu8_f32_nan$1);} );
    use_encoder_for$1(lut_types, undefined, (v, ctx) => {ctx.add_w0(0xf7);} );
    use_encoder_for$1(lut_types, null, (v, ctx) => {ctx.add_w0(0xf6);} );
    use_encoder_for$1(lut_types, true, (v, ctx) => {ctx.add_w0(v ? 0xf5 : 0xf4);} );
    use_encoder_for$1(lut_types, 'utf8', (v, ctx) => {ctx.add_utf8(v);} );
    use_encoder_for$1(lut_types, 42, encode_number$1);
    use_encoder_for$1(lut_types, 42.1, encode_number$1);
    use_encoder_for$1(lut_types, [], (v, ctx) => {ctx.array(v);} );
    use_encoder_for$1(lut_types, {}, (v, ctx) => {ctx.object_pairs(v);} );

    use_encoder_for$1(lut_types, parseInt, (() => {} ) );
    use_encoder_for$1(lut_types, Symbol.iterator, (() => {} ) );


     {// ArrayBuffer and friends
      const ab = new ArrayBuffer(0);
      function encode_bytes(v, ctx) {ctx.add_bytes(v);}
      use_encoder_for$1(lut_types, ab, encode_bytes);

      for (const ArrayDataKlass of [
          Int8Array, Uint8Array, Uint8ClampedArray,
          Int16Array, Uint16Array, Int32Array, Uint32Array,
          Float32Array, Float64Array, DataView] ) {

        use_encoder_for$1(lut_types, new ArrayDataKlass(ab), encode_bytes); } }

    return lut_types}

  const W1$1=24, W2$1=25, W4$1=26, W8$1=27; 

  const sym_cbor$1 = Symbol('cbor');

  const ctx_prototype$1 = bind_ctx_prototype$1();

  function bind_ctx_prototype$1() {
    return {
      __proto__: null,

      // raw_frame,
      // add_w0, add_w1, add_int,
      // add_bytes, add_utf8, add_buffer,
      // float16_short, float32 float64

      tag_encode(tag, value) {
        const end_tag = this.tag(tag);
        this.encode(value);
        return end_tag()}

    , tag(tag, with_tag) {
        if (true === tag) {tag = 0xd9f7;}
        this.add_int(0xc0, tag);
        return with_tag || this.host.with_tag(tag)}

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
        if (undefined !== v[sym_cbor$1]) {
          return v[sym_cbor$1](ctx, v)}

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



  function bind_encoder_context$1(stream) {
    let idx_frame = 0, idx_next = 0;
    if (null == stream) {
      stream = u8concat_outstream$1();}
    else if (!stream.flush && stream[Symbol.asyncIterator]) {
      stream = aiter_outstream$1(stream);}

    const block_size = stream.block_size || 65536;
    const u8_tip = new Uint8Array(block_size);
    const dv_tip = new DataView(u8_tip.buffer);

    const ctx ={
      __proto__: ctx_prototype$1
    , raw_frame

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


    bind_encode_dispatch$1(ctx, cbor_encode);
    return cbor_encode

    function cbor_encode(v, opt) {
      if (undefined === opt || null === opt) {
        ctx.encode(v);}
      else if (true === opt || 'number' === typeof opt) {
        ctx.tag_encode(opt, v);}
      else if (opt.tag) {
        ctx.tag_encode(opt.tag, v);}

      // flush complete cbor_encode op
      if (idx_next === 0) {
        return stream.flush(null)}

      const blk = u8_tip.slice(0, idx_next);
      idx_frame = idx_next = 0;
      return stream.flush(blk)}




    function add_int(mask, v) {
      if (v <= 0xffff) {
        if (v < 24) {// tiny
          next_frame(mask | v, 1);}

        else if (v <= 0xff) {
          u8_tip[ next_frame(mask | W1$1, 2) ] = v;}

        else {
          dv_tip.setUint16(next_frame(mask | W2$1, 3), v); } }

      else if (v <= 0xffffffff) {
        dv_tip.setUint32(next_frame(mask | W4$1, 5), v); }

      else {
        const idx = next_frame(mask | W8$1, 9);

        const v_hi = (v / 0x100000000) | 0;
        dv_tip.setUint32(idx, v_hi);

        const v_lo = v & 0xffffffff;
        dv_tip.setUint32(4+idx, v_lo);
        return} }

    function add_bytes(v) {
      add_buffer(0x40, as_u8_buffer$2(v)); }

    function add_utf8(v) {
      add_buffer(0x60, utf8_to_u8$1(v)); }

    function add_buffer(mask, buf) {
      add_int(mask, buf.byteLength);
      raw_frame(buf);}


    // block paging

    function next_frame(bkind, frameWidth) {
      idx_frame = idx_next; idx_next += frameWidth;
      if (idx_next > block_size) {
        stream.write(u8_tip.slice(0, idx_frame));
        idx_frame = 0;
        idx_next = frameWidth;}

      u8_tip[idx_frame] = bkind;
      return 1 + idx_frame}


    function raw_frame(buf) {
      const len = buf.byteLength;
      idx_frame = idx_next; idx_next += len;
      if (idx_next <= block_size) {
        u8_tip.set(buf, idx_frame);
        return}

      if (0 !== idx_frame) {
        stream.write(u8_tip.slice(0, idx_frame)); }

      idx_frame = idx_next = 0;
      stream.write(buf); } }



  function u8concat_outstream$1() {
    let blocks = [];
    return {
      write(blk) {blocks.push(blk);}
    , flush(blk) {
        if (0 === blocks.length) {
          return blk}

        if (null !== blk) {
          blocks.push(blk);}
        const u8 = u8_concat$2(blocks);
        blocks = [];
        return u8} } }


  function aiter_outstream$1(aiter_out) {
    let _x_tail;
    return {
      write(blk) {
        _x_tail = aiter_out.next(blk);}

    , async flush(blk) {
        let tail = (null !== blk)
          ? aiter_out.next(blk)
          : _x_tail;

        _x_tail = null;
        return await tail} } }

  class CBOREncoderBasic$1 {
    static get create() {
      return stream => new this(stream)}
    static get encode() {
      return new this().encode}
    static get encode_stream() {
      return stream => new this(stream).encode}

    constructor(stream) {
      this.encode = bind_encoder_context$1(stream);
      this.rebind();}

    rebind() {
      this.encode.rebind(this);
      return this}

    with_tag(tag) {return noop$1}

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


  CBOREncoderBasic$1.prototype._encoder_map = new Map();
  function noop$1() {}

  class CBOREncoder$1 extends CBOREncoderBasic$1 {}

  CBOREncoder$1.prototype._encoder_map = basic_tag_encoders$1(new Map());



  function basic_tag_encoders$1(encoders) {
    // tag 1 -- Date
    use_encoder_for$1(encoders, new Date(), (v, ctx) => {
      const end_tag = ctx.tag(1);
      ctx.float64(v / 1000.);
      end_tag();} );

    // tag 32 -- URIs
    use_encoder_for$1(encoders, new URL('ws://h'), (v, ctx) => {
      const end_tag = ctx.tag(32);
      ctx.add_utf8(v.toString());
      end_tag();} );

    // tag 258 -- Sets (explicit type)
    use_encoder_for$1(encoders, new Set(), (v, ctx) => {
      const end_tag = ctx.tag(258);
      ctx.list(v, v.size);
      end_tag();} );

    // tag 259 -- Maps (explicit type)
    use_encoder_for$1(encoders, new Map(), (v, ctx) => {
      const end_tag = ctx.tag(259);
      ctx.pairs(v.entries(), v.size);
      end_tag();} );

    return encoders}

  const objProtoOf = Object.getPrototypeOf;

  class CBOREncoderFull extends CBOREncoder$1 {
    bind_encode_object(ctx, lut_types) {
      const lut_encoders = this._encoder_map;

      return enc_obj$full

      function enc_obj$full(v, ctx) {
         {// Lookup .toCBOR and .toJSON extension points
          if ('function' === typeof v[sym_cbor$1]) {
            v[sym_cbor$1](ctx, v);
            return true}

          if ('function' === typeof v.toJSON) {
            ctx.encode(v.toJSON());
            return true} }

        // Lookup encoder based on constructor
        let encoder = lut_encoders.get(v.constructor);
        if (undefined !== encoder) {
          encoder(v, ctx);
          return true}

        // Lookup encoder based on prototype chain
        for (let vp = objProtoOf(v); vp !== null; vp = objProtoOf(vp)) {
          encoder = lut_encoders.get(vp);
          if (undefined !== encoder) {
            encoder(v, ctx);
            return true} }


        // Iterables become indefinite CBOR arrays
        if (undefined !== v[Symbol.iterator]) {
          ctx.array_stream(v);
          return true}

        ctx.object_pairs(v);
        return true} } }

  const { assert: assert$1 } = require('chai');


  describe('Encode CBOR Test Vectors', (() => {
    for (const test of test_vectors_base) {

      if (! test.roundtrip) {continue}
      if (test.diagnostic) {continue}

      const it_fn = test.skip ? it.skip : test.only ? it.only : it;
      it_fn(`${JSON.stringify(test.decoded)} to "${test.hex}"`, (() => {

        const u8 = CBOREncoder.encode(test.decoded);
        assert$1.equal(u8_to_hex(u8), test.hex);

        const rt = CBORDecoder.decode(u8);
        assert$1.deepEqual([test.decoded], [rt]); } ) ); } } ) );


  describe('Encode CBOR Test Vectors (CBOREncoderFull)', (() => {
    for (const test of test_vectors_base) {

      if (! test.roundtrip) {continue}
      if (test.diagnostic) {continue}

      const it_fn = test.skip ? it.skip : test.only ? it.only : it;
      it_fn(`${JSON.stringify(test.decoded)} to "${test.hex} (full)"`, (() => {

        const u8 = CBOREncoderFull.encode(test.decoded);
        assert$1.equal(u8_to_hex(u8), test.hex);

        const rt = CBORDecoder.decode(u8);
        assert$1.deepEqual([test.decoded], [rt]); } ) ); } } ) );

  const { assert: assert$2 } = require('chai');


  describe('Decode CBOR Tags', (() => {
    it('Tag 0 -- Standard date/time string; see Section 2.4.1', (() => {
      const ans = CBORDecoder.decode(hex_to_u8(
        'c0 74 323031332d30332d32315432303a30343a30305a') );

      assert$2.equal(ans.toISOString(), '2013-03-21T20:04:00.000Z'); } ) );

    it('Tag 1 -- Epoch-based date/time; see Section 2.4.1', (() => {
      const ans = CBORDecoder.decode(hex_to_u8(
        'c1 fb 41d452d9ec200000') );

      assert$2.equal(ans.toISOString(), '2013-03-21T20:04:00.500Z'); } ) );

    it('Tag 24 -- Encoded CBOR data item; see Section 2.4.4.1', (() => {
      const u8 = CBORDecoder.decode(hex_to_u8(
        'd818 456449455446') );

      assert$2.deepEqual(Array.from(u8), [ 100, 73, 69, 84, 70 ]);
      assert$2.equal(typeof u8.decode_cbor, 'function');

      const ans = u8.decode_cbor();
      assert$2.equal(ans, 'IETF'); } ) );

    it('Tag 32 -- URI; see Section 2.4.4.3', (() => {
      const url = CBORDecoder.decode(hex_to_u8(
        'd820 76687474703a2f2f7777772e6578616d706c652e636f6d') );

      assert$2.equal(url.href, 'http://www.example.com/');
      assert$2.equal(url.origin, 'http://www.example.com');
      assert$2.equal(url.protocol, 'http:');
      assert$2.equal(url.pathname, '/'); } ) );

    it('Tag 55799 -- Self-describe CBOR; see Section 2.4.5', (() => {
      const ans = CBORDecoder.decode(hex_to_u8(
        'D9 D9F7 83 01 02 03') );

      assert$2.deepEqual(ans, [1,2,3]); } ) );

    it('Tag 258 -- Sets for CBOR', (() => {
      const s = CBORDecoder.decode(hex_to_u8(
        'D9 0102 83 01 02 03') );

      assert$2.equal(s.has(1), true);
      assert$2.equal(s.has(2), true);
      assert$2.equal(s.has(3), true);

      assert$2.equal(s.size, 3);
      assert$2.equal(s instanceof Set, true); } ) );

    it('Tag 259 -- Explicit Maps for CBOR -- mixed keys', (() => {
      const m = CBORDecoder.decode(hex_to_u8(
        'D9 0103 A3 190796 627631 626b32 627632 83010203 627633') );

      assert$2.ok(m instanceof Map);
      assert$2.equal(m.size, 3);
      assert$2.equal(m.get(1942), 'v1');
      assert$2.equal(m.get('k2'), 'v2'); } ) );

    it('Tag 259 -- Explicit Maps for CBOR -- all string keys', (() => {
      const m = CBORDecoder.decode(hex_to_u8(
        'D9 0103 A2 626B31 627631 626B32 627632') );

      assert$2.ok(m instanceof Map);
      assert$2.equal(m.size, 2);
      assert$2.equal(m.get('k1'), 'v1');
      assert$2.equal(m.get('k2'), 'v2'); } ) ); } ) );

  var test_vectors_float16 = [
    {
      cbor: "+QAA"
    , hex: "f90000"
    , decoded: 0.0}

  , {
      cbor: "+YAA"
    , hex: "f98000"
    , decoded: -0.0}

  , {
      cbor: "+TwA"
    , hex: "f93c00"
    , decoded: 1.0}

  , {
      cbor: "+T4A"
    , hex: "f93e00"
    , decoded: 1.5}

  , {
      cbor: "+Xv/"
    , hex: "f97bff"
    , decoded: 65504.0}

  , {
      cbor: "+QAB"
    , hex: "f90001"
    , decoded: 5.960464477539063e-08}

  , {
      cbor: "+QQA"
    , hex: "f90400"
    , decoded: 6.103515625e-05}

  , {
      cbor: "+cQA"
    , hex: "f9c400"
    , decoded: -4.0}

  , {
      cbor: "+XwA"
    , hex: "f97c00"
    , diagnostic: "Infinity"}

  , {
      cbor: "+X4A"
    , hex: "f97e00"
    , diagnostic: "NaN"}

  , {
      cbor: "+fwA"
    , hex: "f9fc00"
    , diagnostic: "-Infinity"} ];

  var test_vectors_float32 = [
    {
      cbor: "+kfDUAA="
    , hex: "fa47c35000"
    , decoded: 100000.0}

  , {
      cbor: "+n9///8="
    , hex: "fa7f7fffff"
    , decoded: 3.4028234663852886e+38}

  , {
      cbor: "+n+AAAA="
    , hex: "fa7f800000"
    , diagnostic: "Infinity"}

  , {
      cbor: "+n/AAAA="
    , hex: "fa7fc00000"
    , diagnostic: "NaN"}

  , {
      cbor: "+v+AAAA="
    , hex: "faff800000"
    , diagnostic: "-Infinity"} ];

  // algorithm: ftp://ftp.fox-toolkit.org/pub/fasthalffloatconversion.pdf

  const buffer = new ArrayBuffer(4);
  const floatView = new Float32Array(buffer);
  const uint32View = new Uint32Array(buffer);


  const baseTable = new Uint32Array(512);
  const shiftTable = new Uint32Array(512);

  for(let i = 0; i < 256; ++i) {
      const e = i - 127;

      // very small number (0, -0)
      if (e < -27) {
          baseTable[i | 0x000] = 0x0000;
          baseTable[i | 0x100] = 0x8000;
          shiftTable[i | 0x000] = 24;
          shiftTable[i | 0x100] = 24;

      // small number (denorm)
      } else if (e < -14) {
          baseTable[i | 0x000] =  0x0400 >> (-e - 14);
          baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
          shiftTable[i | 0x000] = -e - 1;
          shiftTable[i | 0x100] = -e - 1;

      // normal number
      } else if (e <= 15) {
          baseTable[i | 0x000] =  (e + 15) << 10;
          baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
          shiftTable[i | 0x000] = 13;
          shiftTable[i | 0x100] = 13;

      // large number (Infinity, -Infinity)
      } else if (e < 128) {
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
      if (i === 32) {
          offsetTable[i] = 0;
      } else {
          offsetTable[i] = 1024;
      }
  }

  /**
   * convert a half float number bits to a number.
   * @param {number} float16bits - half float number bits
   * @returns {number} double float
   */
  function convertToNumber(float16bits) {
      const m = float16bits >> 10;
      uint32View[0] = mantissaTable[offsetTable[m] + (float16bits & 0x3ff)] + exponentTable[m];
      return floatView[0];
  }
  function decode_float16(u8) {
    return convertToNumber((u8[0]<<8) | u8[1]) }

  const _lut_u8b2$4 = Array.from(Array(256),
    (_, v) => v.toString(2).padStart(8, '0'));

  const _lut_u8hex$4 = Array.from(Array(256),
    (_, v) => v.toString(16).padStart(2, '0'));

  function u8_to_utf8$1(u8) {
    return new TextDecoder('utf-8').decode(u8) }

  function utf8_to_u8$2(utf8) {
    return new TextEncoder('utf-8').encode(utf8) }

  function as_u8_buffer$3(u8) {
    



    if (u8 instanceof Uint8Array) {
      return u8}
    if (ArrayBuffer.isView(u8)) {
      return new Uint8Array(u8.buffer)}
    if (u8 instanceof ArrayBuffer) {
      return new Uint8Array(u8)}
    return Uint8Array.from(u8)}

  function u8_concat$3(parts) {
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

  async function * u8_as_stream(u8) {
    yield as_u8_buffer$3(u8);}

  const objIs$2 = Object.is;
  const _obj_kind_$2 = Function.call.bind(Object.prototype.toString);

  function bind_encode_dispatch$2(ctx, api) {
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
      lut_types = new Map(lut_common_types$2);

      for (const [k,fn] of host._encoder_map.entries()) {
        if ('string' === typeof k && 'function' === typeof fn) {
          lut_types.set(k, fn); } }

      if (host.bind_encode_object) {
        encode_object = host.bind_encode_object(ctx, lut_types);}

      else if (host.encode_object) {
        encode_object = host.encode_object;}

      if (encode_object) {
        lut_types.set(_obj_kind_$2({}), encode_object); }
      else encode_object = lut_types.get(_obj_kind_$2({})); }


    function encode(v) {
      const encoder = lut_types.get(_obj_kind_$2(v));
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



  const cu8_f32_nan$2 = new Uint8Array([0xfa, 0x7f, 0xc0, 0, 0]);
  const cu8_f32_neg_zero$2 = new Uint8Array([0xfa, 0x80, 0, 0, 0]);
  const lut_raw$2 = bind_builtin_raw$2(new Map());

  function bind_builtin_raw$2(lut_raw) {
    lut_raw.set(-0, cu8_f32_neg_zero$2);
    lut_raw.set(NaN, cu8_f32_nan$2);
    lut_raw.set(Infinity, new Uint8Array([0xfa, 0x7f, 0x80, 0, 0]));
    lut_raw.set(-Infinity, new Uint8Array([0xfa, 0xff, 0x80, 0, 0]));

    return lut_raw}

  function encode_number$2(v, ctx) {
    if (! Number.isSafeInteger(v)) {
      const raw = lut_raw$2.get(v);
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

    else if (objIs$2(-0, v)) {
      // negative zero; does not play well with identity or Map() lookup
      ctx.raw_frame(cu8_f32_neg_zero$2); }

    else {
      // int zero
      ctx.add_w0(0);} }


  function use_encoder_for$2(lut_types, example, ...encoders) {
    for (const fn of encoders) {
      lut_types.set(_obj_kind_$2(example), fn); } }


  const lut_common_types$2 = bind_builtin_types$2(new Map());

  function bind_builtin_types$2(lut_types) {
    use_encoder_for$2(lut_types, NaN, (v, ctx) => {ctx.raw_frame(cu8_f32_nan$2);} );
    use_encoder_for$2(lut_types, undefined, (v, ctx) => {ctx.add_w0(0xf7);} );
    use_encoder_for$2(lut_types, null, (v, ctx) => {ctx.add_w0(0xf6);} );
    use_encoder_for$2(lut_types, true, (v, ctx) => {ctx.add_w0(v ? 0xf5 : 0xf4);} );
    use_encoder_for$2(lut_types, 'utf8', (v, ctx) => {ctx.add_utf8(v);} );
    use_encoder_for$2(lut_types, 42, encode_number$2);
    use_encoder_for$2(lut_types, 42.1, encode_number$2);
    use_encoder_for$2(lut_types, [], (v, ctx) => {ctx.array(v);} );
    use_encoder_for$2(lut_types, {}, (v, ctx) => {ctx.object_pairs(v);} );

    use_encoder_for$2(lut_types, parseInt, (() => {} ) );
    use_encoder_for$2(lut_types, Symbol.iterator, (() => {} ) );


     {// ArrayBuffer and friends
      const ab = new ArrayBuffer(0);
      function encode_bytes(v, ctx) {ctx.add_bytes(v);}
      use_encoder_for$2(lut_types, ab, encode_bytes);

      for (const ArrayDataKlass of [
          Int8Array, Uint8Array, Uint8ClampedArray,
          Int16Array, Uint16Array, Int32Array, Uint32Array,
          Float32Array, Float64Array, DataView] ) {

        use_encoder_for$2(lut_types, new ArrayDataKlass(ab), encode_bytes); } }

    return lut_types}

  const W1$2=24, W2$2=25, W4$2=26, W8$2=27; 

  const sym_cbor$2 = Symbol('cbor');

  const ctx_prototype$2 = bind_ctx_prototype$2();

  function bind_ctx_prototype$2() {
    return {
      __proto__: null,

      // raw_frame,
      // add_w0, add_w1, add_int,
      // add_bytes, add_utf8, add_buffer,
      // float16_short, float32 float64

      tag_encode(tag, value) {
        const end_tag = this.tag(tag);
        this.encode(value);
        return end_tag()}

    , tag(tag, with_tag) {
        if (true === tag) {tag = 0xd9f7;}
        this.add_int(0xc0, tag);
        return with_tag || this.host.with_tag(tag)}

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
        if (undefined !== v[sym_cbor$2]) {
          return v[sym_cbor$2](ctx, v)}

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



  function bind_encoder_context$2(stream) {
    let idx_frame = 0, idx_next = 0;
    if (null == stream) {
      stream = u8concat_outstream$2();}
    else if (!stream.flush && stream[Symbol.asyncIterator]) {
      stream = aiter_outstream$2(stream);}

    const block_size = stream.block_size || 65536;
    const u8_tip = new Uint8Array(block_size);
    const dv_tip = new DataView(u8_tip.buffer);

    const ctx ={
      __proto__: ctx_prototype$2
    , raw_frame

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


    bind_encode_dispatch$2(ctx, cbor_encode);
    return cbor_encode

    function cbor_encode(v, opt) {
      if (undefined === opt || null === opt) {
        ctx.encode(v);}
      else if (true === opt || 'number' === typeof opt) {
        ctx.tag_encode(opt, v);}
      else if (opt.tag) {
        ctx.tag_encode(opt.tag, v);}

      // flush complete cbor_encode op
      if (idx_next === 0) {
        return stream.flush(null)}

      const blk = u8_tip.slice(0, idx_next);
      idx_frame = idx_next = 0;
      return stream.flush(blk)}




    function add_int(mask, v) {
      if (v <= 0xffff) {
        if (v < 24) {// tiny
          next_frame(mask | v, 1);}

        else if (v <= 0xff) {
          u8_tip[ next_frame(mask | W1$2, 2) ] = v;}

        else {
          dv_tip.setUint16(next_frame(mask | W2$2, 3), v); } }

      else if (v <= 0xffffffff) {
        dv_tip.setUint32(next_frame(mask | W4$2, 5), v); }

      else {
        const idx = next_frame(mask | W8$2, 9);

        const v_hi = (v / 0x100000000) | 0;
        dv_tip.setUint32(idx, v_hi);

        const v_lo = v & 0xffffffff;
        dv_tip.setUint32(4+idx, v_lo);
        return} }

    function add_bytes(v) {
      add_buffer(0x40, as_u8_buffer$3(v)); }

    function add_utf8(v) {
      add_buffer(0x60, utf8_to_u8$2(v)); }

    function add_buffer(mask, buf) {
      add_int(mask, buf.byteLength);
      raw_frame(buf);}


    // block paging

    function next_frame(bkind, frameWidth) {
      idx_frame = idx_next; idx_next += frameWidth;
      if (idx_next > block_size) {
        stream.write(u8_tip.slice(0, idx_frame));
        idx_frame = 0;
        idx_next = frameWidth;}

      u8_tip[idx_frame] = bkind;
      return 1 + idx_frame}


    function raw_frame(buf) {
      const len = buf.byteLength;
      idx_frame = idx_next; idx_next += len;
      if (idx_next <= block_size) {
        u8_tip.set(buf, idx_frame);
        return}

      if (0 !== idx_frame) {
        stream.write(u8_tip.slice(0, idx_frame)); }

      idx_frame = idx_next = 0;
      stream.write(buf); } }



  function u8concat_outstream$2() {
    let blocks = [];
    return {
      write(blk) {blocks.push(blk);}
    , flush(blk) {
        if (0 === blocks.length) {
          return blk}

        if (null !== blk) {
          blocks.push(blk);}
        const u8 = u8_concat$3(blocks);
        blocks = [];
        return u8} } }


  function aiter_outstream$2(aiter_out) {
    let _x_tail;
    return {
      write(blk) {
        _x_tail = aiter_out.next(blk);}

    , async flush(blk) {
        let tail = (null !== blk)
          ? aiter_out.next(blk)
          : _x_tail;

        _x_tail = null;
        return await tail} } }

  class CBOREncoderBasic$2 {
    static get create() {
      return stream => new this(stream)}
    static get encode() {
      return new this().encode}
    static get encode_stream() {
      return stream => new this(stream).encode}

    constructor(stream) {
      this.encode = bind_encoder_context$2(stream);
      this.rebind();}

    rebind() {
      this.encode.rebind(this);
      return this}

    with_tag(tag) {return noop$2}

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


  CBOREncoderBasic$2.prototype._encoder_map = new Map();
  function noop$2() {}

  class CBOREncoder$2 extends CBOREncoderBasic$2 {}

  CBOREncoder$2.prototype._encoder_map = basic_tag_encoders$2(new Map());



  function basic_tag_encoders$2(encoders) {
    // tag 1 -- Date
    use_encoder_for$2(encoders, new Date(), (v, ctx) => {
      const end_tag = ctx.tag(1);
      ctx.float64(v / 1000.);
      end_tag();} );

    // tag 32 -- URIs
    use_encoder_for$2(encoders, new URL('ws://h'), (v, ctx) => {
      const end_tag = ctx.tag(32);
      ctx.add_utf8(v.toString());
      end_tag();} );

    // tag 258 -- Sets (explicit type)
    use_encoder_for$2(encoders, new Set(), (v, ctx) => {
      const end_tag = ctx.tag(258);
      ctx.list(v, v.size);
      end_tag();} );

    // tag 259 -- Maps (explicit type)
    use_encoder_for$2(encoders, new Map(), (v, ctx) => {
      const end_tag = ctx.tag(259);
      ctx.pairs(v.entries(), v.size);
      end_tag();} );

    return encoders}

  const {encode, encode_stream} = CBOREncoder$2;

  const decode_types$1 ={
    __proto__: null

  , nested_cbor(u8, ctx) {
      ctx = ctx.from_nested_u8(u8);
      u8.decode_cbor = () => ctx.decode_cbor();
      return u8}

  , u32(u8, idx) {
      const u32 = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
      return u32 >>> 0 }// unsigned int32

  , u64(u8, idx) {
      const v_hi = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
      const v_lo = (u8[idx+4] << 24) | (u8[idx+5] << 16) | (u8[idx+6] << 8) | u8[idx+7];
      const u64 = (v_lo >>> 0) + 0x100000000*(v_hi >>> 0);
      return u64}

  , float16(u8) {
      return {'@f2': u8}}
  , float32(u8, idx=u8.byteOffset) {
      return new DataView(u8.buffer, idx, 4).getFloat32(0)}
  , float64(u8, idx=u8.byteOffset) {
      return new DataView(u8.buffer, idx, 8).getFloat64(0)}

  , bytes(u8) {return u8}
  , bytes_stream: build_bytes$1

  , utf8(u8) {return u8_to_utf8$1(u8)}
  , utf8_stream: build_utf8$1


  , empty_list() {return []}
  , list: build_Array$1
  , list_stream: build_Array$1

  , empty_map() {return {}}
  , map: build_Obj$1
  , map_stream: build_Obj$1};



  function _with_result$1(res, fn, done) {
    fn = fn.bind(res);
    fn.res = res;
    if (undefined !== done) {
      fn.done = done;}
    return fn}

  function _obj_push$1(i, v) {this.push(v);}
  function _bytes_done$1() {
    const res = this.res; this.res = null;
    return u8_concat$3(res)}

  function build_bytes$1(ctx) {
    return _with_result$1([], _obj_push$1, _bytes_done$1) }

  function _utf8_done$1() {
    const res = this.res; this.res = null;
    return res.join('')}
  function build_utf8$1(ctx) {
    return _with_result$1([], _obj_push$1, _utf8_done$1) }



  function _obj_set$1(k, v) {this[k] = v;}

  function build_Obj$1(ctx) {
    return _with_result$1({}, _obj_set$1) }

  function build_Array$1(ctx, len) {
    const res = len ? new Array(len) : [];
    return _with_result$1(res, _obj_set$1) }


  const decode_Map$1 ={
    empty_map: () => new Map()
  , map: build_Map$1
  , map_stream: build_Map$1};

  function _map_set$1(k, v) {this.set(k, v);}
  function build_Map$1(ctx) {
    return _with_result$1(new Map(), _map_set$1) }


  const decode_Set$1 ={
    empty_list: () => new Set()
  , list: build_Set$1
  , list_stream: build_Set$1};

  function _set_add$1(k, v) {this.add(v);}
  function build_Set$1(ctx) {
    return _with_result$1(new Set(), _set_add$1) }

  class CBORDecoderBase$1 {
    // Possible monkeypatch apis responsibilities:
    //   decode() ::
    //   *iter_decode() ::
    //   async decode_stream() ::
    //   async * aiter_decode_stream() ::

    static options(options) {
      return (class extends this {})
        .compile(options)}

    static compile(options) {
      this.prototype.compile(options);
      return this}

    constructor(options) {
      if (null != options) {
        this.compile(options);}

      this._U8Ctx_.bind_decode_api(this);}

    compile(options) {
      this.jmp = this._bind_cbor_jmp(options, this.jmp);

      if (options.types) {
        this.types = Object.assign(
          Object.create(this.types || null),
          options.types); }

      this._U8Ctx_ = this._bind_u8ctx(
        this.types, this.jmp, options.unknown);
      return this} }

  function basic_tags$1(tags_lut) {
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
    tags_lut.set(24, ctx => u8 => ctx.types.nested_cbor(u8, ctx));

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
    tags_lut.set(55799, () => {});


    // EXTENSIONS

    // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    tags_lut.set(258, ctx => { ctx.push_types(decode_Set$1); });

    // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    tags_lut.set(259, ctx => { ctx.push_types(decode_Map$1); });

    return tags_lut}

  // special token
  const cbor_break_sym$1 = Symbol('CBOR-break');
  const cbor_done_sym$1 = Symbol('CBOR-done');
  const cbor_eoc_sym$1 = Symbol('CBOR-EOC');

  const _cbor_jmp_base$1 ={
    bind_jmp(options, jmp) {
      jmp = jmp ? jmp.slice()
        : this.bind_basics_dispatch( new Map() );

      if (null == options) {
        options = {};}

      if (options.simple) {
        this.bind_jmp_simple(options, jmp);}

      if (options.tags) {
        this.bind_jmp_tag(options, jmp);}
      return jmp}

  , bind_jmp_simple(options, jmp) {
      if (options.simple) {
        const as_simple_value = this.bind_simple_dispatch(options.simple);
        const tiny_simple = this.cbor_tiny(as_simple_value);

        for (let i=0xe0; i<= 0xf3; i++) {
          jmp[i] = tiny_simple;}

        jmp[0xf8] = this.cbor_w1(as_simple_value);}
      return jmp}


  , bind_jmp_tag(options, jmp) {
      if (options.tags) {
        const as_tag = this.bind_tag_dispatch(options.tags);
        const tiny_tag = this.cbor_tiny(as_tag);

        for (let i=0xc0; i<= 0xd7; i++) {
          jmp[0xc0 | i] = tiny_tag;}

        jmp[0xd8] = this.cbor_w1(as_tag);
        jmp[0xd9] = this.cbor_w2(as_tag);
        jmp[0xda] = this.cbor_w4(as_tag);
        jmp[0xdb] = this.cbor_w8(as_tag);}

      return jmp}


  , bind_basics_dispatch(tags_lut) {
      const as_tag = this.bind_tag_dispatch(tags_lut || new Map());

      const tiny_pos_int = this.cbor_tiny(this.as_pos_int);
      const tiny_neg_int = this.cbor_tiny(this.as_neg_int);
      const tiny_bytes = this.cbor_tiny(this.as_bytes);
      const tiny_utf8 = this.cbor_tiny(this.as_utf8);
      const tiny_list = this.cbor_tiny(this.as_list);
      const tiny_map = this.cbor_tiny(this.as_map);
      const tiny_tag = this.cbor_tiny(this.as_tag);
      const tiny_simple_repr = this.cbor_tiny(this.as_simple_repr);

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


      const cbor_widths =[
        this.cbor_w1,
        this.cbor_w2,
        this.cbor_w4,
        this.cbor_w8];

      for (let w=0; w< 4; w++) {
        const i = 24+w, cbor_wN = cbor_widths[w];
        jmp[0x00 | i] = cbor_wN(this.as_pos_int);
        jmp[0x20 | i] = cbor_wN(this.as_neg_int);
        jmp[0x40 | i] = cbor_wN(this.as_bytes);
        jmp[0x60 | i] = cbor_wN(this.as_utf8);
        jmp[0x80 | i] = cbor_wN(this.as_list);
        jmp[0xa0 | i] = cbor_wN(this.as_map);
        jmp[0xc0 | i] = cbor_wN(this.as_tag);}


      // streaming data types
      jmp[0x5f] = ctx => this.as_stream(ctx, ctx.types.bytes_stream(ctx));
      jmp[0x7f] = ctx => this.as_stream(ctx, ctx.types.utf8_stream(ctx));
      jmp[0x9f] = ctx => this.as_stream(ctx, ctx.types.list_stream(ctx));
      jmp[0xbf] = ctx => this.as_pair_stream(ctx, ctx.types.map_stream(ctx));

      // semantic tag

      // primitives
      jmp[0xf4] = () => false;
      jmp[0xf5] = () => true;
      jmp[0xf6] = () => null;
      jmp[0xf7] = () => {}; // undefined
      jmp[0xf8] = this.cbor_w1(this.as_simple_repr);
      jmp[0xf9] = this.as_float16;
      jmp[0xfa] = this.as_float32;
      jmp[0xfb] = this.as_float64;
      //jmp[0xfc] = undefined
      //jmp[0xfd] = undefined
      //jmp[0xfe] = undefined
      jmp[0xff] = () => cbor_break_sym$1;

      return jmp}


  , // simple values

    as_pos_int: (ctx, value) => value,
    as_neg_int: (ctx, value) => -1 - value,
    as_simple_repr: (ctx, key) => `simple(${key})`,

    bind_simple_dispatch(simple_lut) {
      if ('function' !== typeof simple_lut.get) {
        throw new TypeError('Expected a simple_value Map') }

      return (ctx, key) => simple_lut.get(key)}



  , // Subclass responsibility: cbor size/value interpreters
    //   cbor_tiny(as_type) :: return function w0_as(ctx, type_b) ::
    //   cbor_w1(as_type) :: return function w1_as(ctx) ::
    //   cbor_w2(as_type) :: return function w2_as(ctx) ::
    //   cbor_w4(as_type) :: return function w4_as(ctx) ::
    //   cbor_w8(as_type) :: return function w8_as(ctx) ::

    // Subclass responsibility: basic types
    //   as_bytes(ctx, len) ::
    //   as_utf8(ctx, len) ::
    //   as_list(ctx, len) ::
    //   as_map(ctx, len) ::

    // Subclass responsibility: streaming types
    //   as_stream(ctx, accum) ::
    //   as_pair_stream(ctx, accum) ::

    // Subclass responsibility: floating point primitives
    //   as_float16(ctx) :: return ctx.types.float16(...)
    //   as_float32(ctx) ::
    //   as_float64(ctx) ::


    // Subclass responsibility: tag values
    };// bind_tag_dispatch(tags_lut) ::

  class U8DecodeBaseCtx$1 {

    static subclass(types, jmp, unknown) {
      class U8DecodeCtx_ extends this {}
      let {prototype} = U8DecodeCtx_;
      prototype.next_value = U8DecodeCtx_.bind_next_value(jmp, unknown);
      prototype.types = types;
      return U8DecodeCtx_}


    from_nested_u8(u8) {
      return this.constructor
        .from_u8(u8, this.types)}


    push_types(overlay_types) {
      let {types, _pop_types, _pop_noop} = this;

      if (_pop_noop === _pop_types) {
        _pop_types = () => {
          this.types = types;}; }

      this._pop_types = (() => {
        this._pop_types = _pop_types;
        this.types = overlay_types;} );
      return types}

    _error_unknown(ctx, type_b) {
      throw new Error(`No CBOR decorder regeistered for ${type_b} (0x${('0'+type_b.toString(16)).slice(-2)})`) }

    _pop_noop() {}

    // Subclass responsibilities:
    //   static bind_decode_api(decoder)
    //   static bind_next_value(jmp, unknown) ::
    //   move(count_bytes) ::

    // Possible Subclass responsibilities:
    //   decode_cbor() ::
    //   *iter_decode_cbor() ::
    //   async decode_cbor() ::
    }//   async * aiter_decode_cbor() ::

  class U8SyncDecodeCtx$1 extends U8DecodeBaseCtx$1 {
    static bind_decode_api(decoder) {
      decoder.decode = u8 =>
        this.from_u8(u8, decoder.types)
          .decode_cbor();

      decoder.iter_decode = u8 =>
        this.from_u8(u8, decoder.types)
          .iter_decode_cbor();}


    static get from_u8() {
      const inst0 = new this();

      return (u8, types) => {
        u8 = as_u8_buffer$3(u8);
        const inst ={
          __proto__: inst0
        , idx: 0, u8
        , _pop_types: inst0._pop_noop};

        if (types && types !== inst0.types) {
          inst.types = types;}
        return inst} }


    static bind_next_value(jmp, unknown) {
      if (null == unknown) {
        unknown = this._error_unknown;}

      return function next_value() {
        const doneTypes = this._pop_types();

        const type_b = this.u8[ this.idx ++ ];
        if (undefined === type_b) {
          this.idx--;
          throw cbor_done_sym$1}

        const decode = jmp[type_b] || unknown;
        const res = decode(this, type_b);

        return undefined === doneTypes
          ? res : doneTypes(res)} }


    decode_cbor() {
      try {
        return this.next_value()}
      catch (e) {
        throw cbor_done_sym$1 !== e ? e
          : new Error(`End of content`) } }


    *iter_decode_cbor() {
      try {
        while (1) {
          yield this.next_value();} }
      catch (e) {
        if (cbor_done_sym$1 !== e) {
          throw e} } }


    move(count_bytes) {
      const {idx, byteLength} = this;
      const idx_next = idx + count_bytes;
      if (idx_next >= byteLength) {
        throw cbor_eoc_sym$1}
      this.idx = idx_next;
      return idx} }

  const _cbor_jmp_sync$1 ={
    __proto__: _cbor_jmp_base$1

  , // cbor size/value interpreters
    cbor_tiny(as_type) {
      return function w0_as(ctx, type_b) {
        return as_type(ctx, type_b & 0x1f) } }

  , cbor_w1(as_type) {
      return function w1_as(ctx) {
        const idx = ctx.move(1);
        return as_type(ctx, ctx.u8[idx]) } }

  , cbor_w2(as_type) {
      return function w2_as(ctx) {
        const u8 = ctx.u8, idx = ctx.move(2);
        return as_type(ctx, (u8[idx] << 8) | u8[idx+1]) } }

  , cbor_w4(as_type) {
      return function w4_as(ctx) {
        const u8 = ctx.u8, idx = ctx.move(4);
        return as_type(ctx, ctx.types.u32(u8, idx)) } }

  , cbor_w8(as_type) {
      return function w8_as(ctx) {
        const u8 = ctx.u8, idx = ctx.move(8);
        return as_type(ctx, ctx.types.u64(u8, idx)) } }


  , // basic types

    as_bytes(ctx, len) {
      const u8 = ctx.u8, idx = ctx.move(len);
      return ctx.types.bytes(
        u8.subarray(idx, idx + len)) }

  , as_utf8(ctx, len) {
      const u8 = ctx.u8, idx = ctx.move(len);
      return ctx.types.utf8(
        u8.subarray(idx, idx + len)) }

  , as_list(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_list()}

      const accum = ctx.types.list(len);
      for (let i=0; i<len; i++) {
        accum(i, ctx.next_value()); }

      return undefined === accum.done ? accum.res : accum.done()}

  , as_map(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_map()}

      const accum = ctx.types.map(len);
      for (let i=0; i<len; i++) {
        const key = ctx.next_value();
        const value = ctx.next_value();
        accum(key, value); }

      return undefined === accum.done ? accum.res : accum.done()}


  , // streaming

    as_stream(ctx, accum) {
      let i = 0;
      while (true) {
        const value = ctx.next_value();
        if (cbor_break_sym$1 === value) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(i++, value); } }

  , as_pair_stream(ctx, accum) {
      while (true) {
        const key = ctx.next_value();
        if (cbor_break_sym$1 === key) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(key, ctx.next_value()); } }


  , // floating point primitives

    as_float16(ctx) {
      const u8 = ctx.u8, idx = ctx.move(2);
      return ctx.types.float16(
        u8.subarray(idx, idx+2)) }

  , as_float32(ctx) {
      const u8 = ctx.u8, idx = ctx.move(4);
      return ctx.types.float32(u8, idx)}

  , as_float64(ctx) {
      const u8 = ctx.u8, idx = ctx.move(8);
      return ctx.types.float64(u8, idx)}


  , // tag values

    bind_tag_dispatch(tags_lut) {
      if ('function' !== typeof tags_lut.get) {
        throw new TypeError('Expected a tags Map') }

      return function(ctx, tag) {
        const tag_handler = tags_lut.get(tag);
        if (tag_handler) {
          const res = tag_handler(ctx, tag);
          const body = ctx.next_value();
          return undefined === res ? body : res(body)}

        return { tag, body: ctx.next_value() }} } };

  class CBORDecoderBasic$1 extends CBORDecoderBase$1 {
    // decode(u8, opt) ::
    static decode(u8, opt) {
      return new this().decode(u8, opt)}

    // *iter_decode(u8, opt) ::
    static iter_decode(u8, opt) {
      return new this().iter_decode(u8, opt)}

    _bind_cbor_jmp(options, jmp) {
      return _cbor_jmp_sync$1.bind_jmp(options, jmp)}

    _bind_u8ctx(types, jmp, unknown) {
      return (this.U8DecodeCtx || U8SyncDecodeCtx$1)
        .subclass(types, jmp, unknown)} }

  CBORDecoderBasic$1.compile({
    types: decode_types$1});


  class CBORDecoder$1 extends CBORDecoderBasic$1 {}

  CBORDecoder$1.compile({
    types: decode_types$1,
    tags: basic_tags$1(new Map()),});

  const {decode: decode$1, iter_decode: iter_decode$1} = new CBORDecoder$1();

  async function * _aiter_move_stream(u8_stream) {
    let n = yield;
    let i0=0, i1=n;
    let u8_tail;

    for await (let u8 of u8_stream) {
      u8 = as_u8_buffer$3(u8);
      if (u8_tail) {
        u8 = u8_concat$3([u8_tail, u8]);
        u8_tail = void 0;}

      while (i1 <= u8.byteLength) {
        n = yield u8.subarray(i0, i1);
        i0 = i1; i1 += n;}

      u8_tail = i0 >= u8.byteLength ? void 0
        : u8.subarray(i0);
      i0 = 0; i1 = n;} }


  class U8AsyncDecodeCtx extends U8DecodeBaseCtx$1 {
    static bind_decode_api(decoder) {
      decoder.decode_stream = (u8_stream) =>
        this.from_u8_stream(u8_stream, decoder.types)
          .decode_cbor();

      decoder.aiter_decode_stream = (u8_stream) =>
        this.from_u8_stream(u8_stream, decoder.types)
          .aiter_decode_cbor();}


    static from_u8(u8, types) {
      return this.from_u8_stream(u8_as_stream(u8), types)}

    static get from_u8_stream() {
      const inst0 = new this();

      return (u8_stream, types) => {
        let u8_aiter = _aiter_move_stream(u8_stream);
        u8_aiter.next(); // prime the async generator

        const inst ={
          __proto__: inst0
        , _pop_types: inst0._pop_noop
        , u8_aiter};

        if (types && types !== inst0.types) {
          inst.types = types;}

        return inst} }

    static bind_next_value(jmp, unknown) {
      if (null == unknown) {
        unknown = this._error_unknown;}

      return async function next_value() {
        const doneTypes = this._pop_types();

        const [type_b] = await this.move_stream(1, cbor_done_sym$1);
        const decode = jmp[type_b] || unknown;
        const res = await decode(this, type_b);

        return undefined === doneTypes
          ? res : await doneTypes(res)} }


    async decode_cbor() {
      try {
        return await this.next_value()}
      catch (e) {
        throw cbor_done_sym$1 !== e ? e
          : new Error(`End of content`) } }


    async *aiter_decode_cbor() {
      try {
        while (1) {
          yield await this.next_value();} }
      catch (e) {
        if (cbor_done_sym$1 !== e) {
          throw e} } }


    async move_stream(count_bytes, eoc_sym=cbor_eoc_sym$1) {
      let tip = await this.u8_aiter.next(count_bytes);
      if (tip.done) {throw eoc_sym}
      return tip.value} }

  const _cbor_jmp_async ={
    __proto__: _cbor_jmp_base$1

  , // cbor size/value interpreters
    cbor_tiny(as_type) {
      return function w0_as(ctx, type_b) {
        return as_type(ctx, type_b & 0x1f) } }

  , cbor_w1(as_type) {
      return async function w1_as(ctx) {
        const u8 = await ctx.move_stream(1);
        return as_type(ctx, u8[0]) } }

  , cbor_w2(as_type) {
      return async function w2_as(ctx) {
        const u8 = await ctx.move_stream(2);
        return as_type(ctx, (u8[0] << 8) | u8[1]) } }

  , cbor_w4(as_type) {
      return async function w4_as(ctx) {
        const u8 = await ctx.move_stream(4);
        return as_type(ctx, ctx.types.u32(u8, 0)) } }

  , cbor_w8(as_type) {
      return async function w8_as(ctx) {
        const u8 = await ctx.move_stream(8);
        return as_type(ctx, ctx.types.u64(u8, 0)) } }


  , // basic types

    async as_bytes(ctx, len) {
      const u8 = await ctx.move_stream(len);
      return ctx.types.bytes(
        u8.subarray(0, len)) }

  , async as_utf8(ctx, len) {
      const u8 = await ctx.move_stream(len);
      return ctx.types.utf8(
        u8.subarray(0, len)) }

  , async as_list(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_list()}

      const accum = ctx.types.list(len);
      for (let i=0; i<len; i++) {
        accum(i, await ctx.next_value()); }

      return undefined === accum.done ? accum.res : accum.done()}

  , async as_map(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_map()}

      const accum = ctx.types.map(len);
      for (let i=0; i<len; i++) {
        const key = await ctx.next_value();
        const value = await ctx.next_value();
        accum(key, value); }

      return undefined === accum.done ? accum.res : accum.done()}


  , // streaming

    async as_stream(ctx, accum) {
      let i = 0;
      while (true) {
        const value = await ctx.next_value();
        if (cbor_break_sym$1 === value) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(i++, value); } }

  , async as_pair_stream(ctx, accum) {
      while (true) {
        const key = await ctx.next_value();
        if (cbor_break_sym$1 === key) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(key, await ctx.next_value()); } }


  , // floating point primitives

    async as_float16(ctx) {
      return ctx.types.float16(
        await ctx.move_stream(2)) }

  , async as_float32(ctx) {
      return ctx.types.float32(
        await ctx.move_stream(4)) }

  , async as_float64(ctx) {
      return ctx.types.float64(
        await ctx.move_stream(8)) }


  , // tag values

    bind_tag_dispatch(tags_lut) {
      if ('function' !== typeof tags_lut.get) {
        throw new TypeError('Expected a tags Map') }

      return async function as_tag(ctx, tag) {
        const tag_handler = tags_lut.get(tag);
        if (tag_handler) {
          const res = await tag_handler(ctx, tag);
          const body = await ctx.next_value();
          return undefined === res ? body : res(body)}

        return { tag, body: await ctx.next_value() }} } };

  class CBORAsyncDecoderBasic extends CBORDecoderBase$1 {
    // async decode_stream(u8_stream, opt) ::
    static decode_stream(u8_stream, opt) {
      return new this().decode_stream(u8_stream, opt)}

    // async *aiter_decode_stream(u8_stream, opt) ::
    static aiter_decode_stream(u8_stream, opt) {
      return new this().aiter_decode_stream(u8_stream, opt)}

    _bind_cbor_jmp(options, jmp) {
      return _cbor_jmp_async.bind_jmp(options, jmp)}

    _bind_u8ctx(types, jmp, unknown) {
      return (this.U8DecodeCtx || U8AsyncDecodeCtx)
        .subclass(types, jmp, unknown)} }

  CBORAsyncDecoderBasic.compile({
    types: decode_types$1});


  class CBORAsyncDecoder extends CBORAsyncDecoderBasic {}

  CBORAsyncDecoder.compile({
    types: decode_types$1,
    tags: basic_tags$1(new Map()),});

  const {decode_stream, aiter_decode_stream} = new CBORAsyncDecoder();

  const { assert: assert$3 } = require('chai');

  const test_vectors = [].concat(
    test_vectors_base
  , test_vectors_float16
  , test_vectors_float32);


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


  const CBORDecoder$2 = CBORDecoderBasic$1.options({
    tags: testing_tags
  , types:{
      float16: decode_float16
    , bytes(u8) {return `h'${u8_to_hex(u8)}'`}
    , bytes_stream(u8) {
        const res = [];
        diag.done = (() =>`(_ ${res.join(', ')})`);
        return diag

        function diag(i, h_u8) {res.push(h_u8);} } } });

  describe('Decode CBOR Test Vectors', (() => {
    for (const test of test_vectors) {

      const it_fn = test.skip ? it.skip : test.only ? it.only : it;
      it_fn(`"${test.hex}" to ${test.diagnostic || JSON.stringify(test.decoded)}`, (() => {
        const u8 = hex_to_u8(test.hex);

        const ans = CBORDecoder$2.decode(u8);
        if (test.diagnostic) {
          try {
            assert$3.equal(test.diagnostic, ans+''); }
          catch (err) {
            console.log(['diag', test.diagnostic, ans]);
            throw err} }
        else {
          try {
            assert$3.deepEqual(test.decoded, ans); }
          catch (err) {
            console.log(['decode', test.decoded, ans]);
            throw err} } } ) ); } } ) );

  const { assert: assert$4 } = require('chai');

  describe('Roundtrip Large Objects', (() => {
    it(`long string`, (() => {
      const s_128k = 'testing '.repeat(128*1024/8);

      const enc_val = encode(s_128k);
      assert$4.equal(enc_val.byteLength, 0x20000 + 1 + 4);

      const dec_val = decode$1(enc_val);
      assert$4.deepEqual(dec_val, s_128k); } ) );

    it(`[null] * 256`, (() => {
      const a_256 = Array(256).fill(null);

      const enc_val = encode(a_256);
      assert$4.equal(enc_val.byteLength, 1 + 2 + a_256.length * (1));

      const dec_val = decode$1(enc_val);
      assert$4.deepEqual(dec_val, a_256); } ) );

    it(`['slot'] * 256`, (() => {

      const sa_256 = Array(256).fill('slot');

      const enc_val = encode(sa_256);
      assert$4.equal(enc_val.byteLength, 1 + 2 + sa_256.length * (1 + 4));

      const dec_val = decode$1(enc_val);
      assert$4.deepEqual(dec_val, sa_256); } ) );


    it(`[['slot'] * 256] * 70`, (() => {

      const sa_256 = Array(256).fill('slot');
      const sa_70_256 = Array(70).fill(sa_256);

      const enc_val = encode(sa_70_256);
      assert$4.equal(enc_val.byteLength,
        1 + 1 + sa_70_256.length * (1 + 2 + sa_256.length * (1 + 4)));

      const dec_val = decode$1(enc_val);
      assert$4.deepEqual(dec_val, sa_70_256); } ) ); } ) );

  const _lut_u8b2$5 = Array.from(Array(256),
    (_, v) => v.toString(2).padStart(8, '0'));

  const _lut_u8hex$5 = Array.from(Array(256),
    (_, v) => v.toString(16).padStart(2, '0'));

  function u8_to_utf8$2(u8) {
    return new TextDecoder('utf-8').decode(u8) }

  function as_u8_buffer$4(u8) {
    



    if (u8 instanceof Uint8Array) {
      return u8}
    if (ArrayBuffer.isView(u8)) {
      return new Uint8Array(u8.buffer)}
    if (u8 instanceof ArrayBuffer) {
      return new Uint8Array(u8)}
    return Uint8Array.from(u8)}

  function u8_concat$4(parts) {
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

  async function * u8_as_stream$1(u8) {
    yield as_u8_buffer$4(u8);}

  const decode_types$2 ={
    __proto__: null

  , nested_cbor(u8, ctx) {
      ctx = ctx.from_nested_u8(u8);
      u8.decode_cbor = () => ctx.decode_cbor();
      return u8}

  , u32(u8, idx) {
      const u32 = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
      return u32 >>> 0 }// unsigned int32

  , u64(u8, idx) {
      const v_hi = (u8[idx] << 24) | (u8[idx+1] << 16) | (u8[idx+2] << 8) | u8[idx+3];
      const v_lo = (u8[idx+4] << 24) | (u8[idx+5] << 16) | (u8[idx+6] << 8) | u8[idx+7];
      const u64 = (v_lo >>> 0) + 0x100000000*(v_hi >>> 0);
      return u64}

  , float16(u8) {
      return {'@f2': u8}}
  , float32(u8, idx=u8.byteOffset) {
      return new DataView(u8.buffer, idx, 4).getFloat32(0)}
  , float64(u8, idx=u8.byteOffset) {
      return new DataView(u8.buffer, idx, 8).getFloat64(0)}

  , bytes(u8) {return u8}
  , bytes_stream: build_bytes$2

  , utf8(u8) {return u8_to_utf8$2(u8)}
  , utf8_stream: build_utf8$2


  , empty_list() {return []}
  , list: build_Array$2
  , list_stream: build_Array$2

  , empty_map() {return {}}
  , map: build_Obj$2
  , map_stream: build_Obj$2};



  function _with_result$2(res, fn, done) {
    fn = fn.bind(res);
    fn.res = res;
    if (undefined !== done) {
      fn.done = done;}
    return fn}

  function _obj_push$2(i, v) {this.push(v);}
  function _bytes_done$2() {
    const res = this.res; this.res = null;
    return u8_concat$4(res)}

  function build_bytes$2(ctx) {
    return _with_result$2([], _obj_push$2, _bytes_done$2) }

  function _utf8_done$2() {
    const res = this.res; this.res = null;
    return res.join('')}
  function build_utf8$2(ctx) {
    return _with_result$2([], _obj_push$2, _utf8_done$2) }



  function _obj_set$2(k, v) {this[k] = v;}

  function build_Obj$2(ctx) {
    return _with_result$2({}, _obj_set$2) }

  function build_Array$2(ctx, len) {
    const res = len ? new Array(len) : [];
    return _with_result$2(res, _obj_set$2) }


  const decode_Map$2 ={
    empty_map: () => new Map()
  , map: build_Map$2
  , map_stream: build_Map$2};

  function _map_set$2(k, v) {this.set(k, v);}
  function build_Map$2(ctx) {
    return _with_result$2(new Map(), _map_set$2) }


  const decode_Set$2 ={
    empty_list: () => new Set()
  , list: build_Set$2
  , list_stream: build_Set$2};

  function _set_add$2(k, v) {this.add(v);}
  function build_Set$2(ctx) {
    return _with_result$2(new Set(), _set_add$2) }

  class CBORDecoderBase$2 {
    // Possible monkeypatch apis responsibilities:
    //   decode() ::
    //   *iter_decode() ::
    //   async decode_stream() ::
    //   async * aiter_decode_stream() ::

    static options(options) {
      return (class extends this {})
        .compile(options)}

    static compile(options) {
      this.prototype.compile(options);
      return this}

    constructor(options) {
      if (null != options) {
        this.compile(options);}

      this._U8Ctx_.bind_decode_api(this);}

    compile(options) {
      this.jmp = this._bind_cbor_jmp(options, this.jmp);

      if (options.types) {
        this.types = Object.assign(
          Object.create(this.types || null),
          options.types); }

      this._U8Ctx_ = this._bind_u8ctx(
        this.types, this.jmp, options.unknown);
      return this} }

  function basic_tags$2(tags_lut) {
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
    tags_lut.set(24, ctx => u8 => ctx.types.nested_cbor(u8, ctx));

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
    tags_lut.set(55799, () => {});


    // EXTENSIONS

    // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    tags_lut.set(258, ctx => { ctx.push_types(decode_Set$2); });

    // CBOR Sets https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    tags_lut.set(259, ctx => { ctx.push_types(decode_Map$2); });

    return tags_lut}

  // special token
  const cbor_break_sym$2 = Symbol('CBOR-break');
  const cbor_done_sym$2 = Symbol('CBOR-done');
  const cbor_eoc_sym$2 = Symbol('CBOR-EOC');

  const _cbor_jmp_base$2 ={
    bind_jmp(options, jmp) {
      jmp = jmp ? jmp.slice()
        : this.bind_basics_dispatch( new Map() );

      if (null == options) {
        options = {};}

      if (options.simple) {
        this.bind_jmp_simple(options, jmp);}

      if (options.tags) {
        this.bind_jmp_tag(options, jmp);}
      return jmp}

  , bind_jmp_simple(options, jmp) {
      if (options.simple) {
        const as_simple_value = this.bind_simple_dispatch(options.simple);
        const tiny_simple = this.cbor_tiny(as_simple_value);

        for (let i=0xe0; i<= 0xf3; i++) {
          jmp[i] = tiny_simple;}

        jmp[0xf8] = this.cbor_w1(as_simple_value);}
      return jmp}


  , bind_jmp_tag(options, jmp) {
      if (options.tags) {
        const as_tag = this.bind_tag_dispatch(options.tags);
        const tiny_tag = this.cbor_tiny(as_tag);

        for (let i=0xc0; i<= 0xd7; i++) {
          jmp[0xc0 | i] = tiny_tag;}

        jmp[0xd8] = this.cbor_w1(as_tag);
        jmp[0xd9] = this.cbor_w2(as_tag);
        jmp[0xda] = this.cbor_w4(as_tag);
        jmp[0xdb] = this.cbor_w8(as_tag);}

      return jmp}


  , bind_basics_dispatch(tags_lut) {
      const as_tag = this.bind_tag_dispatch(tags_lut || new Map());

      const tiny_pos_int = this.cbor_tiny(this.as_pos_int);
      const tiny_neg_int = this.cbor_tiny(this.as_neg_int);
      const tiny_bytes = this.cbor_tiny(this.as_bytes);
      const tiny_utf8 = this.cbor_tiny(this.as_utf8);
      const tiny_list = this.cbor_tiny(this.as_list);
      const tiny_map = this.cbor_tiny(this.as_map);
      const tiny_tag = this.cbor_tiny(this.as_tag);
      const tiny_simple_repr = this.cbor_tiny(this.as_simple_repr);

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


      const cbor_widths =[
        this.cbor_w1,
        this.cbor_w2,
        this.cbor_w4,
        this.cbor_w8];

      for (let w=0; w< 4; w++) {
        const i = 24+w, cbor_wN = cbor_widths[w];
        jmp[0x00 | i] = cbor_wN(this.as_pos_int);
        jmp[0x20 | i] = cbor_wN(this.as_neg_int);
        jmp[0x40 | i] = cbor_wN(this.as_bytes);
        jmp[0x60 | i] = cbor_wN(this.as_utf8);
        jmp[0x80 | i] = cbor_wN(this.as_list);
        jmp[0xa0 | i] = cbor_wN(this.as_map);
        jmp[0xc0 | i] = cbor_wN(this.as_tag);}


      // streaming data types
      jmp[0x5f] = ctx => this.as_stream(ctx, ctx.types.bytes_stream(ctx));
      jmp[0x7f] = ctx => this.as_stream(ctx, ctx.types.utf8_stream(ctx));
      jmp[0x9f] = ctx => this.as_stream(ctx, ctx.types.list_stream(ctx));
      jmp[0xbf] = ctx => this.as_pair_stream(ctx, ctx.types.map_stream(ctx));

      // semantic tag

      // primitives
      jmp[0xf4] = () => false;
      jmp[0xf5] = () => true;
      jmp[0xf6] = () => null;
      jmp[0xf7] = () => {}; // undefined
      jmp[0xf8] = this.cbor_w1(this.as_simple_repr);
      jmp[0xf9] = this.as_float16;
      jmp[0xfa] = this.as_float32;
      jmp[0xfb] = this.as_float64;
      //jmp[0xfc] = undefined
      //jmp[0xfd] = undefined
      //jmp[0xfe] = undefined
      jmp[0xff] = () => cbor_break_sym$2;

      return jmp}


  , // simple values

    as_pos_int: (ctx, value) => value,
    as_neg_int: (ctx, value) => -1 - value,
    as_simple_repr: (ctx, key) => `simple(${key})`,

    bind_simple_dispatch(simple_lut) {
      if ('function' !== typeof simple_lut.get) {
        throw new TypeError('Expected a simple_value Map') }

      return (ctx, key) => simple_lut.get(key)}



  , // Subclass responsibility: cbor size/value interpreters
    //   cbor_tiny(as_type) :: return function w0_as(ctx, type_b) ::
    //   cbor_w1(as_type) :: return function w1_as(ctx) ::
    //   cbor_w2(as_type) :: return function w2_as(ctx) ::
    //   cbor_w4(as_type) :: return function w4_as(ctx) ::
    //   cbor_w8(as_type) :: return function w8_as(ctx) ::

    // Subclass responsibility: basic types
    //   as_bytes(ctx, len) ::
    //   as_utf8(ctx, len) ::
    //   as_list(ctx, len) ::
    //   as_map(ctx, len) ::

    // Subclass responsibility: streaming types
    //   as_stream(ctx, accum) ::
    //   as_pair_stream(ctx, accum) ::

    // Subclass responsibility: floating point primitives
    //   as_float16(ctx) :: return ctx.types.float16(...)
    //   as_float32(ctx) ::
    //   as_float64(ctx) ::


    // Subclass responsibility: tag values
    };// bind_tag_dispatch(tags_lut) ::

  class U8DecodeBaseCtx$2 {

    static subclass(types, jmp, unknown) {
      class U8DecodeCtx_ extends this {}
      let {prototype} = U8DecodeCtx_;
      prototype.next_value = U8DecodeCtx_.bind_next_value(jmp, unknown);
      prototype.types = types;
      return U8DecodeCtx_}


    from_nested_u8(u8) {
      return this.constructor
        .from_u8(u8, this.types)}


    push_types(overlay_types) {
      let {types, _pop_types, _pop_noop} = this;

      if (_pop_noop === _pop_types) {
        _pop_types = () => {
          this.types = types;}; }

      this._pop_types = (() => {
        this._pop_types = _pop_types;
        this.types = overlay_types;} );
      return types}

    _error_unknown(ctx, type_b) {
      throw new Error(`No CBOR decorder regeistered for ${type_b} (0x${('0'+type_b.toString(16)).slice(-2)})`) }

    _pop_noop() {}

    // Subclass responsibilities:
    //   static bind_decode_api(decoder)
    //   static bind_next_value(jmp, unknown) ::
    //   move(count_bytes) ::

    // Possible Subclass responsibilities:
    //   decode_cbor() ::
    //   *iter_decode_cbor() ::
    //   async decode_cbor() ::
    }//   async * aiter_decode_cbor() ::

  async function * _aiter_move_stream$1(u8_stream) {
    let n = yield;
    let i0=0, i1=n;
    let u8_tail;

    for await (let u8 of u8_stream) {
      u8 = as_u8_buffer$4(u8);
      if (u8_tail) {
        u8 = u8_concat$4([u8_tail, u8]);
        u8_tail = void 0;}

      while (i1 <= u8.byteLength) {
        n = yield u8.subarray(i0, i1);
        i0 = i1; i1 += n;}

      u8_tail = i0 >= u8.byteLength ? void 0
        : u8.subarray(i0);
      i0 = 0; i1 = n;} }


  class U8AsyncDecodeCtx$1 extends U8DecodeBaseCtx$2 {
    static bind_decode_api(decoder) {
      decoder.decode_stream = (u8_stream) =>
        this.from_u8_stream(u8_stream, decoder.types)
          .decode_cbor();

      decoder.aiter_decode_stream = (u8_stream) =>
        this.from_u8_stream(u8_stream, decoder.types)
          .aiter_decode_cbor();}


    static from_u8(u8, types) {
      return this.from_u8_stream(u8_as_stream$1(u8), types)}

    static get from_u8_stream() {
      const inst0 = new this();

      return (u8_stream, types) => {
        let u8_aiter = _aiter_move_stream$1(u8_stream);
        u8_aiter.next(); // prime the async generator

        const inst ={
          __proto__: inst0
        , _pop_types: inst0._pop_noop
        , u8_aiter};

        if (types && types !== inst0.types) {
          inst.types = types;}

        return inst} }

    static bind_next_value(jmp, unknown) {
      if (null == unknown) {
        unknown = this._error_unknown;}

      return async function next_value() {
        const doneTypes = this._pop_types();

        const [type_b] = await this.move_stream(1, cbor_done_sym$2);
        const decode = jmp[type_b] || unknown;
        const res = await decode(this, type_b);

        return undefined === doneTypes
          ? res : await doneTypes(res)} }


    async decode_cbor() {
      try {
        return await this.next_value()}
      catch (e) {
        throw cbor_done_sym$2 !== e ? e
          : new Error(`End of content`) } }


    async *aiter_decode_cbor() {
      try {
        while (1) {
          yield await this.next_value();} }
      catch (e) {
        if (cbor_done_sym$2 !== e) {
          throw e} } }


    async move_stream(count_bytes, eoc_sym=cbor_eoc_sym$2) {
      let tip = await this.u8_aiter.next(count_bytes);
      if (tip.done) {throw eoc_sym}
      return tip.value} }

  const _cbor_jmp_async$1 ={
    __proto__: _cbor_jmp_base$2

  , // cbor size/value interpreters
    cbor_tiny(as_type) {
      return function w0_as(ctx, type_b) {
        return as_type(ctx, type_b & 0x1f) } }

  , cbor_w1(as_type) {
      return async function w1_as(ctx) {
        const u8 = await ctx.move_stream(1);
        return as_type(ctx, u8[0]) } }

  , cbor_w2(as_type) {
      return async function w2_as(ctx) {
        const u8 = await ctx.move_stream(2);
        return as_type(ctx, (u8[0] << 8) | u8[1]) } }

  , cbor_w4(as_type) {
      return async function w4_as(ctx) {
        const u8 = await ctx.move_stream(4);
        return as_type(ctx, ctx.types.u32(u8, 0)) } }

  , cbor_w8(as_type) {
      return async function w8_as(ctx) {
        const u8 = await ctx.move_stream(8);
        return as_type(ctx, ctx.types.u64(u8, 0)) } }


  , // basic types

    async as_bytes(ctx, len) {
      const u8 = await ctx.move_stream(len);
      return ctx.types.bytes(
        u8.subarray(0, len)) }

  , async as_utf8(ctx, len) {
      const u8 = await ctx.move_stream(len);
      return ctx.types.utf8(
        u8.subarray(0, len)) }

  , async as_list(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_list()}

      const accum = ctx.types.list(len);
      for (let i=0; i<len; i++) {
        accum(i, await ctx.next_value()); }

      return undefined === accum.done ? accum.res : accum.done()}

  , async as_map(ctx, len) {
      if (0 === len) {
        return ctx.types.empty_map()}

      const accum = ctx.types.map(len);
      for (let i=0; i<len; i++) {
        const key = await ctx.next_value();
        const value = await ctx.next_value();
        accum(key, value); }

      return undefined === accum.done ? accum.res : accum.done()}


  , // streaming

    async as_stream(ctx, accum) {
      let i = 0;
      while (true) {
        const value = await ctx.next_value();
        if (cbor_break_sym$2 === value) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(i++, value); } }

  , async as_pair_stream(ctx, accum) {
      while (true) {
        const key = await ctx.next_value();
        if (cbor_break_sym$2 === key) {
          return undefined === accum.done ? accum.res : accum.done()}

        accum(key, await ctx.next_value()); } }


  , // floating point primitives

    async as_float16(ctx) {
      return ctx.types.float16(
        await ctx.move_stream(2)) }

  , async as_float32(ctx) {
      return ctx.types.float32(
        await ctx.move_stream(4)) }

  , async as_float64(ctx) {
      return ctx.types.float64(
        await ctx.move_stream(8)) }


  , // tag values

    bind_tag_dispatch(tags_lut) {
      if ('function' !== typeof tags_lut.get) {
        throw new TypeError('Expected a tags Map') }

      return async function as_tag(ctx, tag) {
        const tag_handler = tags_lut.get(tag);
        if (tag_handler) {
          const res = await tag_handler(ctx, tag);
          const body = await ctx.next_value();
          return undefined === res ? body : res(body)}

        return { tag, body: await ctx.next_value() }} } };

  class CBORAsyncDecoderBasic$1 extends CBORDecoderBase$2 {
    // async decode_stream(u8_stream, opt) ::
    static decode_stream(u8_stream, opt) {
      return new this().decode_stream(u8_stream, opt)}

    // async *aiter_decode_stream(u8_stream, opt) ::
    static aiter_decode_stream(u8_stream, opt) {
      return new this().aiter_decode_stream(u8_stream, opt)}

    _bind_cbor_jmp(options, jmp) {
      return _cbor_jmp_async$1.bind_jmp(options, jmp)}

    _bind_u8ctx(types, jmp, unknown) {
      return (this.U8DecodeCtx || U8AsyncDecodeCtx$1)
        .subclass(types, jmp, unknown)} }

  CBORAsyncDecoderBasic$1.compile({
    types: decode_types$2});


  class CBORAsyncDecoder$1 extends CBORAsyncDecoderBasic$1 {}

  CBORAsyncDecoder$1.compile({
    types: decode_types$2,
    tags: basic_tags$2(new Map()),});

  const {decode_stream: decode_stream$1, aiter_decode_stream: aiter_decode_stream$1} = new CBORAsyncDecoder$1();

  async function * u8_as_test_stream(u8, test_stream_mode) {
    switch (test_stream_mode) {
      case undefined:
      case 'whole':
        yield u8;
        return

      case 'halves':
        let ih = u8.byteLength >> 1;
        yield u8.slice(0, ih);
        yield u8.slice(ih);
        return

      case 'frames':
      case 'frame8':
        return yield * _aiter_u8_frames(u8, 8)

      case 'byte':
        return yield * _aiter_u8_frames(u8, 1)

      default:
        throw new Error(`Unknown stream mode: ${test_stream_mode}`)} }


  async function * _aiter_u8_frames(u8, frame_size=8) {
    for (let i=0; i<u8.byteLength; i += frame_size)
      yield u8.slice(i, i+frame_size);}

  const { assert: assert$5 } = require('chai');

  describe('Async Decode CBOR Tags', (async () => {

    for (let test_stream_mode of ['whole', 'halves', 'frames', 'byte']) {
      describe(`streamed by ${test_stream_mode}`, (() => {

        let hex_to_u8_stream = hex_u8 =>
          u8_as_test_stream(hex_to_u8(hex_u8), test_stream_mode);


        it('Tag 0 -- Standard date/time string; see Section 2.4.1', (async () => {
          const ans = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'c0 74 323031332d30332d32315432303a30343a30305a') );

          assert$5.equal(ans.toISOString(), '2013-03-21T20:04:00.000Z'); }) );

        it('Tag 1 -- Epoch-based date/time; see Section 2.4.1', (async () => {
          const ans = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'c1 fb 41d452d9ec200000') );

          assert$5.equal(ans.toISOString(), '2013-03-21T20:04:00.500Z'); }) );

        it('Tag 24 -- Encoded CBOR data item; see Section 2.4.4.1', (async () => {
          const u8 = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'd818 456449455446') );

          assert$5.deepEqual(Array.from(u8), [ 100, 73, 69, 84, 70 ]);
          assert$5.equal(typeof u8.decode_cbor, 'function');

          const ans = await u8.decode_cbor();
          assert$5.equal(ans, 'IETF'); }) );

        it('Tag 32 -- URI; see Section 2.4.4.3', (async () => {
          const url = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'd820 76687474703a2f2f7777772e6578616d706c652e636f6d') );

          assert$5.equal(url.href, 'http://www.example.com/');
          assert$5.equal(url.origin, 'http://www.example.com');
          assert$5.equal(url.protocol, 'http:');
          assert$5.equal(url.pathname, '/'); }) );

        it('Tag 55799 -- Self-describe CBOR; see Section 2.4.5', (async () => {
          const ans = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'D9 D9F7 83 01 02 03') );

          assert$5.deepEqual(ans, [1,2,3]); }) );

        it('Tag 258 -- Sets for CBOR', (async () => {
          const s = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'D9 0102 83 01 02 03') );

          assert$5.equal(s.has(1), true);
          assert$5.equal(s.has(2), true);
          assert$5.equal(s.has(3), true);

          assert$5.equal(s.size, 3);
          assert$5.equal(s instanceof Set, true); }) );

        it('Tag 259 -- Explicit Maps for CBOR -- mixed keys', (async () => {
          const m = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'D9 0103 A3 190796 627631 626b32 627632 83010203 627633') );

          assert$5.ok(m instanceof Map);
          assert$5.equal(m.size, 3);
          assert$5.equal(m.get(1942), 'v1');
          assert$5.equal(m.get('k2'), 'v2'); }) );

        it('Tag 259 -- Explicit Maps for CBOR -- all string keys', (async () => {
          const m = await CBORAsyncDecoder$1.decode_stream(hex_to_u8_stream(
            'D9 0103 A2 626B31 627631 626B32 627632') );

          assert$5.ok(m instanceof Map);
          assert$5.equal(m.size, 2);
          assert$5.equal(m.get('k1'), 'v1');
          assert$5.equal(m.get('k2'), 'v2'); }) ); }) ); } }) );

  const { assert: assert$6 } = require('chai');

  const test_vectors$1 = [].concat(
    test_vectors_base
  , test_vectors_float16
  , test_vectors_float32);


  function tag_as_diagnostic$1(decoder, tag) {
    return v => `${tag}(${JSON.stringify(v)})`}

  function tag_as_hex_diagnostic$1(decoder, tag) {
    return v => `${tag}(${v})`}

  const testing_tags$1 = new Map();
  testing_tags$1.set(0, tag_as_diagnostic$1 );// Standard date/time string
  testing_tags$1.set(1, tag_as_diagnostic$1 );// Epoch-based date/time
  testing_tags$1.set(2, tag_as_hex_diagnostic$1 );// Positive bignum
  testing_tags$1.set(3, tag_as_hex_diagnostic$1 );// Negative bignum
  testing_tags$1.set(23, tag_as_hex_diagnostic$1 );// Expected conversion to base16 encoding
  testing_tags$1.set(24, tag_as_hex_diagnostic$1 );// Encoded CBOR data item
  testing_tags$1.set(32, tag_as_diagnostic$1 );// URI


  const CBORAsyncDecoder$2 = CBORAsyncDecoderBasic.options({
    tags: testing_tags$1
  , types:{
      float16: decode_float16
    , bytes(u8) {return `h'${u8_to_hex(u8)}'`}
    , bytes_stream(u8) {
        const res = [];
        diag.done = (() =>`(_ ${res.join(', ')})`);
        return diag

        function diag(i, h_u8) {res.push(h_u8);} } } });

  describe('Async Decode CBOR Test Vectors', (() => {
    for (const test of test_vectors$1) {
      describe(`"${test.hex}" to ${test.diagnostic || JSON.stringify(test.decoded)}`, (() => {
        for (let test_stream_mode of ['whole', 'halves', 'frames', 'byte']) {
          const it_fn = test.skip ? it.skip : test.only ? it.only : it;
          it_fn(`streamed by ${test_stream_mode}`, (async () => {
            const u8 = hex_to_u8(test.hex);

            const ans = await CBORAsyncDecoder$2.decode_stream(
              u8_as_test_stream(u8, test_stream_mode));

            if (test.diagnostic) {
              try {
                assert$6.equal(test.diagnostic, ans+''); }
              catch (err) {
                console.log(['diag', test.diagnostic, ans]);
                throw err} }
            else {
              try {
                assert$6.deepEqual(test.decoded, ans); }
              catch (err) {
                console.log(['decode', test.decoded, ans]);
                throw err} } }) ); } }) ); } } ) );

  const { assert: assert$7 } = require('chai');

  describe('Async Roundtrip Large Objects', (() => {
    for (let test_stream_mode of ['whole', 'halves', 'frames' ]) {
      describe(`streamed by ${test_stream_mode}`, (() => {
        it(`long string`, (async () => {
          const s_128k = 'testing '.repeat(128*1024/8);

          const enc_val = encode(s_128k);
          assert$7.equal(enc_val.byteLength, 0x20000 + 1 + 4);

          const dec_val = await decode_stream(
            u8_as_test_stream(enc_val, test_stream_mode));
          assert$7.deepEqual(dec_val, s_128k); }) );

        it(`[null] * 256`, (async () => {
          const a_256 = Array(256).fill(null);

          const enc_val = encode(a_256);
          assert$7.equal(enc_val.byteLength, 1 + 2 + a_256.length * (1));

          const dec_val = await decode_stream(
            u8_as_test_stream(enc_val, test_stream_mode));
          assert$7.deepEqual(dec_val, a_256); }) );

        it(`['slot'] * 256`, (async () => {

          const sa_256 = Array(256).fill('slot');

          const enc_val = encode(sa_256);
          assert$7.equal(enc_val.byteLength, 1 + 2 + sa_256.length * (1 + 4));

          const dec_val = await decode_stream(
            u8_as_test_stream(enc_val, test_stream_mode));
          assert$7.deepEqual(dec_val, sa_256); }) );


        it(`[['slot'] * 256] * 70`, (async () => {

          const sa_256 = Array(256).fill('slot');
          const sa_70_256 = Array(70).fill(sa_256);

          const enc_val = encode(sa_70_256);
          assert$7.equal(enc_val.byteLength,
            1 + 1 + sa_70_256.length * (1 + 2 + sa_256.length * (1 + 4)));

          const dec_val = await decode_stream(
            u8_as_test_stream(enc_val, test_stream_mode));
          assert$7.deepEqual(dec_val, sa_70_256); }) ); }) ); } }) );

  const { assert: assert$8 } = require('chai');

  describe('Async Iterator Decode Stream', (() => {
    let known_hex_data =[
      'a2627473c1fb41d6fbc6ae0000006872656164696e677348db0f494083f9a23e',
      'a2627473c1fb41d6fbca320000006872656164696e677348f304b53ff304353f',
      'a2627473c1fb41d6fbcdb60000006872656164696e6773488e5d1340d95bde3e',
      'a2627473c1fb41d6fbd13a0000006872656164696e6773481872313f3baab83f',
      'a2627473c1fb41d6fbd4be0000006872656164696e67734854f82d40b25abc3e',
      'a2627473c1fb41d6fbd8420000006872656164696e677348d95bde3e8e5d1340',
      'a2627473c1fb41d6fbdbc60000006872656164696e6773483baab83f1872313f',];

    let known_u8_data = hex_to_u8(known_hex_data.join(''));

    for (let test_stream_mode of ['whole', 'halves', 'frames', 'byte' ]) {
      it(`streamed by ${test_stream_mode}`, (async () => {
        let obj_stream = aiter_decode_stream(
          u8_as_test_stream(known_u8_data, test_stream_mode));

        let idx = 0;
        for await (let each of obj_stream) {
          let u8_rt = encode(each);
          let hex_rt = u8_to_hex(u8_rt);
          assert$8.equal(hex_rt, known_hex_data[ idx++ ]);} }) ); } }) );

  const { assert: assert$9 } = require('chai');

  describe('Async Iterator Encode Stream', (() => {
    let known_hex_data = (
      'a2627473c1fb41d6fbc6ae0000006872656164696e677348db0f494083f9a23e' +
      'a2627473c1fb41d6fbca320000006872656164696e677348f304b53ff304353f' +
      'a2627473c1fb41d6fbcdb60000006872656164696e6773488e5d1340d95bde3e' +
      'a2627473c1fb41d6fbd13a0000006872656164696e6773481872313f3baab83f' +
      'a2627473c1fb41d6fbd4be0000006872656164696e67734854f82d40b25abc3e' +
      'a2627473c1fb41d6fbd8420000006872656164696e677348d95bde3e8e5d1340' +
      'a2627473c1fb41d6fbdbc60000006872656164696e6773483baab83f1872313f');

    let known_u8_data = hex_to_u8(known_hex_data);

    for (let test_stream_mode of ['whole', 'halves', 'frames', 'byte' ]) {
      it(`streamed by ${test_stream_mode}`, (async () => {
        let obj_stream = aiter_decode_stream(
          u8_as_test_stream(known_u8_data, test_stream_mode));


        let _aiter_out = _test_out_aiter(known_hex_data);
        await _aiter_out.next();


        let _cbor_encode = encode_stream(_aiter_out);
        for await (let each of obj_stream) {
          await _cbor_encode(each);}


        let ans = await _aiter_out.return();
        assert$9.deepEqual({value: true, done: true}, ans);}) ); } }) );


  async function * _test_out_aiter(known_hex) {
    let actual = [];

    try {
      while (1) {
        let u8 = (yield);
        actual.push(u8_to_hex( u8 )); } }

    finally {
      actual = actual.join('');
      assert$9.equal(known_hex, actual);
      return true} }

  (require('source-map-support') || {install(){}}).install();

}());
