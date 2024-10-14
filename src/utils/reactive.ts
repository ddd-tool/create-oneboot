export interface ReactiveWrapperType<T> {
  value: T
  readonly _listeners: Set<(newValue: T, oldValue: T) => void>
  hadInitialized(): boolean
}
export type UnWatch = () => void

export function ref<T>(v: T): ReactiveWrapperType<T>
export function ref<T = never>(): ReactiveWrapperType<T | undefined>
export function ref<T>(v?: T): typeof data {
  type RealType = typeof v extends undefined ? T | undefined : T
  let _hadInitialized = v !== undefined
  const data: ReactiveWrapperType<RealType> = {
    value: v as RealType,
    _listeners: new Set(),
    hadInitialized(): boolean {
      return _hadInitialized
    },
  }
  return new Proxy(data, {
    get: (obj: ReactiveWrapperType<RealType>, k: 'value') => {
      return obj[k]
    },
    set: (obj: ReactiveWrapperType<RealType>, k: 'value', v: RealType) => {
      if (v === obj[k]) {
        return true
      } else if (!_hadInitialized && v !== undefined) {
        _hadInitialized = true
      }
      obj[k] = v
      for (const f of obj._listeners) {
        f(v, obj[k])
      }
      return true
    },
  })
}

export function unRef<T>(reactiveVal: ReactiveWrapperType<T>) {
  return reactiveVal.value
}

export function watch<T>(reactiveVal: ReactiveWrapperType<T>, onUpdate: (n: T, o: T) => void): UnWatch {
  const listener = onUpdate
  reactiveVal._listeners.add(listener)
  return () => reactiveVal._listeners.delete(listener)
}
