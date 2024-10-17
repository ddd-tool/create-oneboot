import { describe, it, expect } from '@jest/globals'
import { accumulate } from '../../src/utils/fun'

describe('test funUtil', () => {
  it('test accumulate', () => {
    let count = 0
    count = accumulate(count, 5, (acc) => {
      return ++acc
    })
    expect(count).toBe(5)
  })
})
