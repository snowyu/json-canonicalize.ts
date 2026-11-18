#!/usr/bin/env node

// Copyright 2006-2021 WebPKI.org (http://webpki.org).
// Licensed under the Apache License, Version 2.0.
//
// Replays the number generator from cyberphone/json-canonicalization
// testdata/numgen.js at commit 32a48195b9b20fe67b1795e39e4509f14d860b45.

'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const SOURCE_ROWS = 100000000
const FIRST_ROWS = 200
const SAMPLE_ROWS = 2000
const ADDITIONAL_ROWS = SAMPLE_ROWS - FIRST_ROWS
const EXPECTED_SOURCE_SHA256 =
  '0f7dda6b0837dde083c5d6b896f7d62340c8a2415b0c7121d83145e08a755272'

// staticU64s from the pinned upstream numgen.js, in source order.
const STATIC_BITS = [
  '0000000000000000',
  '8000000000000000',
  '0000000000000001',
  '8000000000000001',
  'c46696695dbd1cc3',
  'c43211ede4974a35',
  'c3fce97ca0f21056',
  'c3c7213080c1a6ac',
  'c39280f39a348556',
  'c35d9b1f5d20d557',
  'c327af4c4a80aaac',
  'c2f2f2a36ecd5556',
  'c2be51057e155558',
  'c28840d131aaaaac',
  'c253670dc1555557',
  'c21f0b4935555557',
  'c1e8d5d42aaaaaac',
  'c1b3de4355555556',
  'c17fca0555555556',
  'c1496e6aaaaaaaab',
  'c114585555555555',
  'c0e046aaaaaaaaab',
  'c0aa0aaaaaaaaaaa',
  'c074d55555555555',
  'c040aaaaaaaaaaab',
  'c00aaaaaaaaaaaab',
  'bfd5555555555555',
  'bfa1111111111111',
  'bf6b4e81b4e81b4f',
  'bf35d867c3ece2a5',
  'bf0179ec9cbd821e',
  'becbf647612f3696',
  'be965e9f80f29212',
  'be61e54c672874db',
  'be2ca213d840baf8',
  'bdf6e80fe033c8c6',
  'bdc2533fe68fd3d2',
  'bd8d51ffd74c861c',
  'bd5774ccac3d3817',
  'bd22c3d6f030f9ac',
  'bcee0624b3818f79',
  'bcb804ea293472c7',
  'bc833721ba905bd3',
  'bc4ebe9c5db3c61e',
  'bc18987d17c304e5',
  'bbe3ad30dfcf371d',
  'bbaf7b816618582f',
  'bb792f9ab81379bf',
  'bb442615600f9499',
  'bb101e77800c76e1',
  'bad9ca58cce0be35',
  'baa4a1e0a3e6fe90',
  'ba708180831f320d',
  'ba3a68cd9e985016',
  '446696695dbd1cc3',
  '443211ede4974a35',
  '43fce97ca0f21056',
  '43c7213080c1a6ac',
  '439280f39a348556',
  '435d9b1f5d20d557',
  '4327af4c4a80aaac',
  '42f2f2a36ecd5556',
  '42be51057e155558',
  '428840d131aaaaac',
  '4253670dc1555557',
  '421f0b4935555557',
  '41e8d5d42aaaaaac',
  '41b3de4355555556',
  '417fca0555555556',
  '41496e6aaaaaaaab',
  '4114585555555555',
  '40e046aaaaaaaaab',
  '40aa0aaaaaaaaaaa',
  '4074d55555555555',
  '4040aaaaaaaaaaab',
  '400aaaaaaaaaaaab',
  '3fd5555555555555',
  '3fa1111111111111',
  '3f6b4e81b4e81b4f',
  '3f35d867c3ece2a5',
  '3f0179ec9cbd821e',
  '3ecbf647612f3696',
  '3e965e9f80f29212',
  '3e61e54c672874db',
  '3e2ca213d840baf8',
  '3df6e80fe033c8c6',
  '3dc2533fe68fd3d2',
  '3d8d51ffd74c861c',
  '3d5774ccac3d3817',
  '3d22c3d6f030f9ac',
  '3cee0624b3818f79',
  '3cb804ea293472c7',
  '3c833721ba905bd3',
  '3c4ebe9c5db3c61e',
  '3c18987d17c304e5',
  '3be3ad30dfcf371d',
  '3baf7b816618582f',
  '3b792f9ab81379bf',
  '3b442615600f9499',
  '3b101e77800c76e1',
  '3ad9ca58cce0be35',
  '3aa4a1e0a3e6fe90',
  '3a708180831f320d',
  '3a3a68cd9e985016',
  '4024000000000000',
  '4014000000000000',
  '3fe0000000000000',
  '3fa999999999999a',
  '3f747ae147ae147b',
  '3f40624dd2f1a9fc',
  '3f0a36e2eb1c432d',
  '3ed4f8b588e368f1',
  '3ea0c6f7a0b5ed8d',
  '3e6ad7f29abcaf48',
  '3e35798ee2308c3a',
  '3ed539223589fa95',
  '3ed4ff26cd5a7781',
  '3ed4f95a762283ff',
  '3ed4f8c60703520c',
  '3ed4f8b72f19cd0d',
  '3ed4f8b5b31c0c8d',
  '3ed4f8b58d1c461a',
  '3ed4f8b5894f7f0e',
  '3ed4f8b588ee37f3',
  '3ed4f8b588e47da4',
  '3ed4f8b588e3849c',
  '3ed4f8b588e36bb5',
  '3ed4f8b588e36937',
  '3ed4f8b588e368f8',
  '3ed4f8b588e368f1',
  '3ff0000000000000',
  'bff0000000000000',
  'bfeffffffffffffa',
  'bfeffffffffffffb',
  '3feffffffffffffa',
  '3feffffffffffffb',
  '3feffffffffffffc',
  '3feffffffffffffe',
  'bfefffffffffffff',
  'bfefffffffffffff',
  '3fefffffffffffff',
  '3fefffffffffffff',
  '3fd3333333333332',
  '3fd3333333333333',
  '3fd3333333333334',
  '0010000000000000',
  '000ffffffffffffd',
  '000fffffffffffff',
  '7fefffffffffffff',
  'ffefffffffffffff',
  '4340000000000000',
  'c340000000000000',
  '4430000000000000',
  '44b52d02c7e14af5',
  '44b52d02c7e14af6',
  '44b52d02c7e14af7',
  '444b1ae4d6e2ef4e',
  '444b1ae4d6e2ef4f',
  '444b1ae4d6e2ef50',
  '3eb0c6f7a0b5ed8c',
  '3eb0c6f7a0b5ed8d',
  '41b3de4355555553',
  '41b3de4355555554',
  '41b3de4355555555',
  '41b3de4355555556',
  '41b3de4355555557',
  'becbf647612f3696',
  '43143ff3c1cb0959',
]

const sampleLines = new Set()
for (let line = 1; line <= FIRST_ROWS; line++) sampleLines.add(line)
for (let k = 1; k <= ADDITIONAL_ROWS; k++) {
  sampleLines.add(
    FIRST_ROWS + Math.floor((k * (SOURCE_ROWS - FIRST_ROWS)) / ADDITIONAL_ROWS)
  )
}
if (sampleLines.size !== SAMPLE_ROWS) {
  throw new Error(
    `Expected ${SAMPLE_ROWS} distinct sample rows, got ${sampleLines.size}`
  )
}

function normalizeBits(bits) {
  return bits.replace(/^0+(?=.)/, '')
}

function bitsAt(buffer, offset) {
  const high = buffer.readUInt32LE(offset + 4).toString(16)
  const low = buffer.readUInt32LE(offset).toString(16).padStart(8, '0')
  return normalizeBits(high + low)
}

let sourceIndex = 0
let hashBlock = Buffer.alloc(32)
let hashOffset = 32
const serialBytes = Buffer.alloc(8)

function nextNumber() {
  let bits
  let value

  if (sourceIndex < STATIC_BITS.length) {
    bits = normalizeBits(STATIC_BITS[sourceIndex])
    value = Buffer.from(
      STATIC_BITS[sourceIndex].padStart(16, '0'),
      'hex'
    ).readDoubleBE(0)
  } else if (sourceIndex < STATIC_BITS.length + 2000) {
    const serialIndex = sourceIndex - STATIC_BITS.length
    serialBytes.writeUInt32LE(serialIndex, 0)
    serialBytes.writeUInt32LE(0x00100000, 4)
    bits = bitsAt(serialBytes, 0)
    value = serialBytes.readDoubleLE(0)
  } else {
    do {
      if (hashOffset >= hashBlock.length) {
        hashBlock = crypto.createHash('sha256').update(hashBlock).digest()
        hashOffset = 0
      }
      value = hashBlock.readDoubleLE(hashOffset)
      bits = bitsAt(hashBlock, hashOffset)
      hashOffset += 8
    } while (value === 0 || !Number.isFinite(value))
  }

  sourceIndex++
  return { bits, value }
}

const sourceHash = crypto.createHash('sha256')
const rows = []
for (let line = 1; line <= SOURCE_ROWS; line++) {
  const { bits, value } = nextNumber()
  const expected = value.toString()
  sourceHash.update(bits + ',' + expected + '\n')

  if (sampleLines.has(line)) {
    rows.push(JSON.stringify({ id: 'numbers:' + line, bits, expected }) + '\n')
  }
}

const sourceSha256 = sourceHash.digest('hex')
if (sourceSha256 !== EXPECTED_SOURCE_SHA256) {
  throw new Error(
    `Upstream source SHA-256 mismatch: expected ${EXPECTED_SOURCE_SHA256}, got ${sourceSha256}`
  )
}
if (rows.length !== SAMPLE_ROWS) {
  throw new Error(`Expected ${SAMPLE_ROWS} rows, generated ${rows.length}`)
}

const outputPath =
  process.argv[2] ||
  path.join(__dirname, '..', 'src/__tests__/jcs-vectors/numbers.jsonl')
fs.writeFileSync(outputPath, rows.join(''))
process.stdout.write(
  `Wrote ${rows.length} rows from ${SOURCE_ROWS} upstream rows; source SHA-256 ${sourceSha256}\n`
)
