export function accumulate<T>(accumulator: T, times: number, callback: (accumulator: T, index: number) => T): T {
  Array.from({ length: times }).forEach((_, index) => {
    accumulator = callback(accumulator, index)
  })
  return accumulator
}
