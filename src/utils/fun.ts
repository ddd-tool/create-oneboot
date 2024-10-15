import { ref } from '@vue/reactivity'

export function accumulate<T>(accumulator: T, times: number, callback: (accumulator: T, index: number) => T): T {
  Array.from({ length: times }).forEach((_, index) => {
    accumulator = callback(accumulator, index)
  })
  return accumulator
}

export function createTimeout(timeoutMs: number, timeoutError = new Error('timeout!')): typeof api {
  let timeout: undefined | null | ReturnType<typeof setTimeout> = undefined
  let resolve = ref(() => {
    if (!timeout) {
      timeout = null
      return
    }
    clearTimeout(timeout!)
    timeout = null
  })
  let reject = ref((_: Error) => {})
  const reset = (ms: number = timeoutMs) => {
    if (!timeout) {
      return
    }
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      reject.value(timeoutError)
    }, ms)
    timeoutMs = ms
  }
  let promise = new Promise<void>((innerResolve, innerReject) => {
    if (timeout === null) {
      innerResolve()
      return
    }
    timeout = setTimeout(() => {
      innerReject(timeoutError)
    }, timeoutMs)
    resolve.value = () => {
      innerResolve()
      clearTimeout(timeout!)
      timeout = null
    }
    reject.value = () => {
      innerReject(timeoutError)
    }
  })
  const api = {
    resolve,
    reject,
    reset,
    promise,
  }
  return api
}
