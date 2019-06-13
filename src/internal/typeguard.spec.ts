import {isArrayOf, isString} from './typeguard'

describe('isString', () => {
  it('should check if values are strings', () => {
    const value: string | number = ''

    if (isString(value)) {
      const dummy: string = value
    }

    expect(isString('')).toBe(true)
    expect(isString(0)).toBe(false)
    expect(isString([])).toBe(false)
  })
})

describe('isArrayOf', () => {
  it('should check arrays properly', () => {
    const value: (string | number)[] = ['foo', 'bar']

    if (isArrayOf(value, isString)) {
      const dummy: string[] = value
    }

    expect(isArrayOf(['', ''], isString)).toBe(true)
    expect(isArrayOf(['', 2], isString)).toBe(false)
    expect(isArrayOf(2, isString)).toBe(false)
  })
})
