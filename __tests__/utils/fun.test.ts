import { describe, it, expect } from '@jest/globals'
import { createTimeout, accumulate } from '../../src/utils/fun'

describe('test funUtil', () => {
  it('test createTimeout1', async () => {
    const { promise } = createTimeout(5, new Error('timeout!'))
    await expect(promise).rejects.toThrow('timeout!')
  })
  it('test createTimeout2', async () => {
    const { resolve, promise } = createTimeout(5)
    resolve.value()
    await promise
  })
  it('test createTimeout3', async () => {
    const { resolve, promise } = createTimeout(5)
    setTimeout(() => {
      resolve.value()
    }, 3)
    await promise
  })
  it('test createTimeout4', async () => {
    const { resolve, reset, promise } = createTimeout(5)
    setTimeout(() => {
      resolve.value()
    }, 3)
    await promise
  })
  it('test accumulate', () => {
    let count = 0
    count = accumulate(count, 5, (acc) => {
      return ++acc
    })
    expect(count).toBe(5)
  })
})
