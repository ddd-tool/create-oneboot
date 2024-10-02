import { onCancel } from './utils/common'
import { useArgs } from './stores/args'
import lang from './lang'
import execGenVoMapper from './gen-vo-mapper'

const t = lang.action.t
console.info(t('sign.scriptStart'))

const argsStore = useArgs()

init()
  .then(() => {
    console.info(t('sign.successComplete'))
  })
  .catch((e: Error) => {
    console.error(e.message)
    console.error(t('sign.exitWithError'))
  })

process.on('SIGINT', onCancel)

async function init() {
  await argsStore.action.init()
  switch (argsStore.state.currentCommand.value) {
    case 'genVoMapper':
      execGenVoMapper()
      break
    case 'none':
      break
  }
}
