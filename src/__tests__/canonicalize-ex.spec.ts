// tslint:disable max-line-length
// tslint:disable no-magic-numbers
import { canonicalizeEx as canonicalize } from '../canonicalize-ex'

describe('json canonicalize ex', () => {
  it('should canonicalize primary types', () => {
    const obj = {
      text: '你好',
      num: 47734.12,
      dt: new Date('2018-12-17T01:08:19.719Z'),
      arr: [56, 'a', '12', { t: '455A', a: 123 }],
    }
    expect(canonicalize(obj)).toEqual(
      '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"dt":"2018-12-17T01:08:19.719Z","num":47734.12,"text":"你好"}'
    )
  })
  it('should canonicalize primary types and exclude a prop', () => {
    const obj = {
      text: '你好',
      num: 47734.12,
      dt: new Date('2018-12-17T01:08:19.719Z'),
      arr: [56, 'a', '12', { t: '455A', a: 123 }],
    }
    expect(canonicalize(obj, { exclude: 'num' })).toEqual(
      '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"dt":"2018-12-17T01:08:19.719Z","text":"你好"}'
    )
  })
  it('should canonicalize primary types and exclude multi props', () => {
    const obj = {
      text: '你好',
      num: 47734.12,
      dt: new Date('2018-12-17T01:08:19.719Z'),
      arr: [56, 'a', '12', { t: '455A', a: 123 }],
    }
    expect(canonicalize(obj, { exclude: ['num', 'dt'] })).toEqual(
      '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"text":"你好"}'
    )
  })
  it('should canonicalize primary types and include multi props', () => {
    const obj = {
      text: '你好',
      num: 47734.12,
      dt: new Date('2018-12-17T01:08:19.719Z'),
      arr: [56, 'a', '12', { t: '455A', a: 123 }],
    }
    const result = canonicalize(obj, { include: ['text', 'arr'] })
    expect(result).toEqual(
      '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"text":"你好"}'
    )
  })
})
