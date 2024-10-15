import { onCancel } from '@/utils/business'
import { useArgsStore } from '@/stores/args'
import { execGenVoMapper } from '@/commands/gen-vo-mapper'
import { t as $t } from '@/i18n'
import packageInfo from '@/utils/package-info'

console.info($t('signal.scriptStart'))

const argsStore = useArgsStore()

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
  console.log(`repository addr: ${packageInfo.repository.url.replace(/git\+/g, '')}`)
  console.log(`script version: ${packageInfo.version}`)
  console.log('')
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
