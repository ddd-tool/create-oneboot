import lang from '../lang'

const t = lang.action.t

export function onCancel() {
  throw Error(t('error.userCancel'))
}

export function onError(str: string) {
  throw Error(t('error.business', { str }))
}

export function isValidPath(path: string): boolean {
  return !!path && path.length > 0
}

export function isValidPackageName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_])*$/.test(name)
}

export function tuple<T extends any[]>(...args: T) {
  return Object.freeze(args)
}
