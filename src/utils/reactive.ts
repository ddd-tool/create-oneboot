type DataType = any | undefined | null
type ReactiveWrapperType<T extends DataType> = {
  value: T
  _watchCallbacks: Function[]
}

export function ref<T>(v?: T | null): typeof data {
  const data: ReactiveWrapperType<T> = {
    value: v!,
    _watchCallbacks: [],
  }
  return new Proxy(data, {
    get: (obj: any, k: any) => {
      return obj[k]
    },
    set: (obj: any, k: any, v: any) => {
      obj[k] = v
      for (const f of obj._watchCallbacks) {
        f(obj[k], v)
      }
      return true
    },
  })
}

export function watch(reactiveVal: ReactiveWrapperType<any>, callback: Function) {
  reactiveVal._watchCallbacks.push(callback)
}
