export function upperFirst(str: string | String) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function snakeToUpperCamel(str: string | String) {
  return str
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

export function lowerFirst(str: string | String) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}
