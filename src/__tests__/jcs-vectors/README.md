# RFC 8785 vector provenance

The six paired input and output files are copied from `testdata/input/` and
`testdata/output/` in `cyberphone/json-canonicalization` at commit
`32a48195b9b20fe67b1795e39e4509f14d860b45`. The files are distributed under
Apache License 2.0; see the adjacent `LICENSE` file.

`numbers.jsonl` is a 2,000-row sample of the upstream ES6 number-formatting
file [`es6testfile100m.txt.gz`](https://github.com/cyberphone/json-canonicalization/releases/download/es6testfile/es6testfile100m.txt.gz)
(SHA-256 `545455ec9e74b68042c22a2607fb9d4a5f5fdb3c79f883ce864c75189a70705f`).
The uncompressed upstream file has 100,000,000 rows. To regenerate the sample,
run `node scripts/generate-jcs-number-vectors.js` from the repository root. The
script replays the number sequence generator in `testdata/numgen.js` at the
upstream commit above, using only Node.js built-ins; it does not write the
100-million-row intermediate file. Before writing the sample, it checks the
full sequence's SHA-256 against
`0f7dda6b0837dde083c5d6b896f7d62340c8a2415b0c7121d83145e08a755272`.

The sample keeps source rows 1 through 200. For each integer `k` from 1
through 1,800, it then keeps source row
`200 + floor(k * (100,000,000 - 200) / 1,800)`. This yields 2,000 distinct rows
spanning the full source through row 100,000,000. Each row keeps its 1-based
source line as the local ID `numbers:<line>`; the upstream file itself has no
ID column. The `bits` and `expected` fields are transcribed from the upstream
`hex-ieee,expected` columns. All sampled rows come from the upstream sequence;
the fixture adds no generated boundary cases.

These vectors exercise the JavaScript engine's number formatting, which this
library delegates to the engine. The sample keeps 2,000 cases as a broad
engine-regression sweep.
