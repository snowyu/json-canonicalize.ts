// tslint:disable max-line-length
// tslint:disable no-magic-numbers
import { canonicalize } from '../canonicalize'

describe('json canonicalize', () => {
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
  it('should canonicalize object attribute undefined', () => {
    const obj = {
      text: undefined,
      num: 47734.12,
      dt: new Date('2018-12-17T01:08:19.719Z'),
      arr: [56, 'a', '12', { t: '455A', a: 123 }],
    }
    expect(canonicalize(obj)).toEqual(
      '{"arr":[56,"a","12",{"a":123,"t":"455A"}],"dt":"2018-12-17T01:08:19.719Z","num":47734.12}'
    )
  })
  it('should canonicalize array item undefined', () => {
    const obj = {
      arr: [undefined, null, 56, 'a', '12', { t: '455A', a: 123 }],
    }
    expect(canonicalize(obj)).toEqual(
      '{"arr":[null,null,56,"a","12",{"a":123,"t":"455A"}]}'
    )
  })
})
