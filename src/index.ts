import './i18n'
import { onCancel } from './utils/business'
import { useArgs } from './stores/args'
import execGenVoMapper from './gen-vo-mapper'
import { t as $t } from './i18n'

console.info($t('signal.scriptStart'))

const argsStore = useArgs()

start()
  .then(() => {
    console.info($t('signal.successComplete'))
  })
  .catch((e: Error) => {
    console.error(e.message)
    console.error($t('signal.exitWithError'))
  })

process.on('SIGINT', onCancel)

async function start() {
  await argsStore.action.init()
  const subcommand = argsStore.state.currentCommand.value
  if (subcommand === 'genVoMapper') {
    await execGenVoMapper()
  } else if (subcommand === 'none') {
    return
  } else {
    isNever(subcommand)
  }
}
