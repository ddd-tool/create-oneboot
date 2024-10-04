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

export function upperFirst(str: string | String) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function snakeToUpperCamel(str: string | String) {
  return str
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}
