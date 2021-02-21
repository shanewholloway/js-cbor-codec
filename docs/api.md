# cbor-codec API

- Decoding from CBOR in to objects
  - Standard [Decoder](./api_decode.md) for JSON-like codecs.
  - [Async Decoder](./api_decode_async.md) for streaming.
- Encoding objects in to CBOR
  - Standard [Encoder](./api_encode.md).
  - [Full encoder](./api_encode_full.md).
  - [Encoding to output streams](./api_encode_stream.md).
- [Custom CBOR Tags](./api_tags.md)
- [Utilities for Uint8Array](./api_utils.md) used internally by `cbor-codec`.
- [LevelDB/LevelDown codec support](./leveldown.md).
- [CBOR-259 explicit maps](./CBOR-259-spec--explicit-maps.md)

#### Example

- See [`demo.mjs`](../examples/demo.mjs)
- See [`demo_iter.mjs`](../examples/demo_iter.mjs)

