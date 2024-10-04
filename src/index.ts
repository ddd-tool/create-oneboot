import { onCancel } from './utils/common'
import { useArgs } from './stores/args'
import lang from './lang'
import execGenVoMapper from './gen-vo-mapper'

const t = lang.action.t
console.info(t('signal.scriptStart'))

const argsStore = useArgs()

start()
  .then(() => {
    console.info(t('signal.successComplete'))
  })
  .catch((e: Error) => {
    console.error(e.message)
    console.error(t('signal.exitWithError'))
  })

process.on('SIGINT', onCancel)

async function start() {
  await argsStore.action.init()
  switch (argsStore.state.currentCommand.value) {
    case 'genVoMapper':
      execGenVoMapper()
      break
    case 'none':
      break
  }
}
