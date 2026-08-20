// Test ESM import
import { canonicalize, canonicalizeEx } from '../index'

describe('ESM import', () => {
  it('should export canonicalize function', () => {
    expect(typeof canonicalize).toBe('function')
  })

  it('should export canonicalizeEx function', () => {
    expect(typeof canonicalizeEx).toBe('function')
  })

  it('should work with canonicalize', () => {
    const obj = { a: 1, b: 2 }
    expect(canonicalize(obj)).toBe('{"a":1,"b":2}')
  })

  it('should work with canonicalizeEx', () => {
    const obj = { a: 1, b: 2 }
    expect(canonicalizeEx(obj)).toBe('{"a":1,"b":2}')
  })
})