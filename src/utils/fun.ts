export function forTimes(times: number) {
  return {
    reduce: <T>(callback: (accumulator: T, index: number) => T, accumulator: T) => {
      return reduce(times, callback, accumulator)
    },
  }
}

function reduce<T>(times: number, callback: (accumulator: T, index: number) => T, accumulator: T) {
  Array.from({ length: times }).forEach((_, index) => {
    accumulator = callback(accumulator, index)
  })
  return accumulator
}

function reduceObj<T extends object>(
  times: number,
  callback: (accumulator: T, index: number) => T,
  accumulator: T = {} as T
) {
  Array.from({ length: times }).forEach((_, index) => {
    accumulator = callback(accumulator, index)
  })
  return accumulator
}

function reduceArr<T extends Array<any>>(
  times: number,
  callback: (accumulator: T, index: number) => T,
  accumulator: T = [] as unknown as T
) {
  Array.from({ length: times }).forEach((_, index) => {
    accumulator = callback(accumulator, index)
  })
  return accumulator
}
