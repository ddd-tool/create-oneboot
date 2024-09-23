import lang from '../lang'
import { defaultArgsVal, type Args } from './define'
import { ref } from './reactive'

const t = lang.action.t
const currentArgs = ref(defaultArgsVal)

function onCancel() {
  throw Error(t('error.userCancel'))
}

function configArgsFromUserArgs() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    return
  }
  const userArgs = (args as any).reduce((result: any, arg: string) => {
    const [key, value] = arg.split('=')
    if (!key) {
      throw Error(t('error.invalidArgs', { str: arg }))
    } else if (value === undefined) {
      result[key] = true
    } else {
      result[key] = value
    }
    return result
  }, {}) as unknown as Args
  currentArgs.value = Object.assign(currentArgs.value, userArgs)
}

function tuple<T extends any[]>(...args: T) {
  return Object.freeze(args)
}

export default {
  state: {
    currentArgs,
  },
  action: {
    onCancel,
    configArgsFromUserArgs,
    tuple,
  },
}
