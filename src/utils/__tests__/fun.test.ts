import { describe, it, expect } from '@jest/globals'
import * as funUtil from '../fun'

describe('test funUtil', () => {
  it('test forTimes', () => {
    let count = funUtil.forTimes(5).reduce((acc) => {
      return ++acc
    }, 0)
    expect(count).toBe(5)
  })
})
