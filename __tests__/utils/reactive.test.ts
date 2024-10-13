import { describe, it, expect } from '@jest/globals'
import { ref, watch } from '../../src/utils/reactive'
import { createTimeout } from '../../src/utils/fun'

describe('test reactiveUtil', () => {
  it('test ref', async () => {
    const i = ref<number>()
    expect(i.hadInitialized()).toBe(false)
    i.value = 1
    expect(i.value).toBe(1)
    expect(i.hadInitialized()).toBe(true)
    i.value = 2
    expect(i.value).toBe(2)
    i.value = undefined
    expect(i.value).toBe(undefined)
    expect(i.hadInitialized()).toBe(true)
  })

  it('test trigger watch', async () => {
    {
      const { resolve, promise } = createTimeout(5)
      const x = ref(1)
      watch(x, (v) => {
        expect(v).toBe(2)
        resolve.value()
      })
      x.value = 2
      await promise
    }
    {
      const { resolve, promise } = createTimeout(5)
      const x = ref(1)
      watch(x, () => {
        throw new Error('same value should not trigger watch')
      })
      x.value = 1
      setTimeout(() => {
        resolve.value()
      }, 3)
      await promise
    }
  })

  it('test unwatch', async () => {
    const { resolve, promise } = createTimeout(5)
    const x = ref(1)
    const unWatch = watch(x, () => {
      throw new Error('same value should not trigger watch')
    })
    unWatch()
    x.value = 2
    x.value = 3
    setTimeout(() => {
      resolve.value()
    }, 3)
    await promise
  })
})
