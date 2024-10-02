type DataType = any | undefined | null
interface ReactiveWrapperType<T extends DataType> {
  value: T
  hasInitialized: () => boolean
  _initialized: boolean
  _watchCallbacks: Function[]
}

export function ref<T>(v?: T | null): typeof data {
  const data: ReactiveWrapperType<T> = {
    value: v!,
    hasInitialized: function () {
      return this._initialized
    },
    _initialized: v === undefined,
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
      data._initialized = true
      return true
    },
  })
}

export function watch(reactiveVal: ReactiveWrapperType<any>, callback: Function) {
  reactiveVal._watchCallbacks.push(callback)
}
