### Utilities

- `hex_to_u8(hex : string) : Uint8Array` decodes a hex-encoded string into an `Uint8Array`. Cross platform.
- `u8_to_hex(u8 : Uint8Array) : string` encodes an `Uint8Array` into a hex-encoded string. Cross platform.
- `u8_to_utf8(u8 : Uint8Array) : string` decodes an `Uint8Array` into an UTF-8 string. Cross platform.
- `utf8_to_u8(sz : string) : Uint8Array` encodes a UTF-8 string into an `Uint8Array`. Cross platform.
- `u8_concat(parts : Array<Uint8Array>)` concatenates one or more `Uint8Array`.
- `as_u8_buffer(u8 : Uint8Array | Buffer) : Uint8Array` adapts parameter into an `Uint8Array`.
- `u8_as_stream(u8 : Uint8Array | Buffer) : AsyncIterator` adapts parameter into an async iterable.

```html
<script type=module>
  import {
    hex_to_u8, u8_to_hex,
    u8_to_utf8, utf8_to_u8,
    u8_concat, as_u8_buffer, u8_as_stream,
  } from "//cdn.jsdelivr.net/npm/cbor-codec/esm/index.mjs"
</script>
```
