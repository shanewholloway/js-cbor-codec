# Map explicit datatype for CBOR

This document specifies a tag for an explicit Map datatype in Concise Binary Object Representation (CBOR) [1].

    Tag: 259 (map)
    Data item: map
    Semantics: Map datatype with key-value operations (e.g. `.get()/.set()/.delete()`)
    Reference: https://github.com/js-cbor-code/blob/master/docs/CBOR-259-spec--explicit-maps.md
    Contact: Shane Holloway <shane.holloway@ieee.org>

## Introduction

In JSON, and therefore JavaScript, the standard object hash mapping allows only
string-typed keys. Implementations like [`borc@2.0.4`][borc] and
[`node-cbor@4.1.1`][node-cbor] detect and promote mappings with non-string keys
into `new Map()` instances. This complicates the decoders and introduces
ambiguity for the developer that explicitly wants to use Map instances.

  [borc]: https://www.npmjs.com/package/borc
  [node-cbor]: https://www.npmjs.com/package/cbor

## Semantics

Apply tag 259 to a CBOR map data item to indicate that decoders should return a
mapping datatype with key-value operations. (e.g. `.get()/.set()/.delete()`) The
return instance must present a consistent API for the consuming developer.


## Rationale

CBOR is a standardized and compact replacement for JSON. The Map datatype is
common to many programming languages, but often distinct from `{}` semantics
from JSON. Legacy applications using CBOR as a replacement for JSON
serialization will depend on handling `{}` consistent with JSON parsers.
Explicit handling of Map datatypes allows addressing legacy use cases with
no ambiguity cases where a Map is expected.

An explicit Map tag follows precedent set by expected conversion tags [21:
base64url][RFC7049], [22: base64][RFC7049], and [23: base16][RFC7049] from
RFC-7049, as well as [Tag 258's explicit Set datatype][tag-258].

 [tag-258]:	https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md


## Examples

### Mixed keys

Given the following JavaScript instance:

```javascript
new Map( [ [1942, 'v1'], ['k2', 'v2'], [[1,2,3], 'v3'] ] )
```

The equivalent value as a set in CBOR diagnostic notation is

```javascript
259({1942: "v1", "k2": "v2", [1, 2, 3]: "v3"})
```

And its encoding is:

    D9 0103       # tag(259)
       A3         # map(3)
          19 0796 # unsigned(1942)
          62      # text(2)
             7631 # "v1"
          62      # text(2)
             6B32 # "k2"
          62      # text(2)
             7632 # "v2"
          83      # array(3)
             01   # unsigned(1)
             02   # unsigned(2)
             03   # unsigned(3)
          62      # text(2)
             7633 # "v3"


### All-string keys

Given the following JavaScript instance:

```javascript
new Map( [ ['k1', 'v1'], ['k2', 'v2'] ] )
```

The equivalent value as a set in CBOR diagnostic notation is

```javascript
259({"k1": "v1", "k2": "v2"})
```

And its encoding is:

    D9 0103       # tag(259)
       A2         # map(2)
          62      # text(2)
             6B31 # "k1"
          62      # text(2)
             7631 # "v1"
          62      # text(2)
             6B32 # "k2"
          62      # text(2)
             7632 # "v2"

## References

[1] [C. Bormann, and P. Hoffman. "Concise Binary Object Representation (CBOR)". RFC 7049, October 2013.][RFC7049]

  [RFC7049]: https://tools.ietf.org/html/rfc7049#section-2.4

## Authors

Shane Holloway <shane.holloway@ieee.org>
