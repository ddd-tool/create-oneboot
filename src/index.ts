import { configArgsFromUserChoise } from './utils/questions'
import common from './utils/common'
import lang from './lang'
import * as parser from './utils/parser'

const t = lang.action.t

init()
  .then(() => {
    console.info(t('sign.successComplete'))
  })
  .catch((e: Error) => {
    console.error(e.message)
    console.error(t('sign.exitWithError'))
  })

process.on('SIGINT', common.action.onCancel)

async function init() {
  common.action.configArgsFromUserArgs()
  const nonInteractive = common.state.currentArgs.value['--non-interactive']
  if (!nonInteractive) {
    await configArgsFromUserChoise()
  }
  const code = `public record HelloWorld (String attr1) {}`
  console.log(JSON.stringify(parser.java.parse(code), null, 2))
}
