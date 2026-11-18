import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { canonicalize } from '../canonicalize'
import { canonicalizeEx } from '../canonicalize-ex'

// Vectors are from cyberphone/json-canonicalization commit 32a48195b9b20fe67b1795e39e4509f14d860b45 (Apache-2.0).
const vectorDirectory = join(__dirname, 'jcs-vectors')
const inputDirectory = join(vectorDirectory, 'input')
const outputDirectory = join(vectorDirectory, 'output')

describe('RFC 8785 input vectors', () => {
  const inputFiles = readdirSync(inputDirectory)
    .filter((file) => file.endsWith('.json'))
    .sort()

  const canonicalizers = [
    ['canonicalize', canonicalize],
    ['canonicalizeEx', canonicalizeEx],
  ] as const

  canonicalizers.forEach(([name, serialize]) => {
    describe(name, () => {
      inputFiles.forEach((file) => {
        it(`canonicalizes ${file}`, () => {
          const input = JSON.parse(
            readFileSync(join(inputDirectory, file), 'utf8')
          )
          const expected = readFileSync(join(outputDirectory, file), 'utf8')

          expect(serialize(input)).toBe(expected)
        })
      })
    })
  })
})

describe('RFC 8785 number vectors', () => {
  const vectors = readFileSync(join(vectorDirectory, 'numbers.jsonl'), 'utf8')
    .trimEnd()
    .split('\n')
    .map(
      (line) =>
        JSON.parse(line) as { id: string; bits: string; expected: string }
    )

  vectors.forEach(({ id, bits, expected }) => {
    it(id, () => {
      const value = Buffer.from(bits.padStart(16, '0'), 'hex').readDoubleBE()

      expect(canonicalize(value)).toBe(expected)
    })
  })
})

describe('RFC 8785 rejection vectors', () => {
  it.skip('rejects duplicate property names (JSON.parse discards earlier duplicate values)', () => {})

  it.skip('rejects an inexact integer token (JSON.parse rounds it to binary64 before canonicalize receives it)', () => {})

  it('rejects numbers outside the binary64 range after JSON.parse overflows them', () => {
    expect(() => canonicalize(JSON.parse('1e400'))).toThrow(
      'Non-finite number (Infinity) is not permitted in JSON'
    )
    expect(() => canonicalize(JSON.parse('-1e400'))).toThrow(
      'Non-finite number (-Infinity) is not permitted in JSON'
    )
  })

  it('currently escapes a lone high surrogate (tracked in issue #30)', () => {
    expect(canonicalize({ a: '\uD83D' })).toBe('{"a":"\\ud83d"}')
  })

  it('currently escapes a lone low surrogate (tracked in issue #30)', () => {
    expect(canonicalize({ a: '\uDC00' })).toBe('{"a":"\\udc00"}')
  })
})
