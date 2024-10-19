import './global-impl'
import { onCancel } from '@/utils/business'
import { useArgsAgg } from '@/domains/args'
import { useGenVoMapperAgg } from '@/domains/gen-vo-mapper'
import { useI18nAgg } from '@/domains/i18n'
import packageInfo from '@/utils/package-info'

const $t = useI18nAgg().actions.t

console.info($t('signal.scriptStart'))

const argsStore = useArgsAgg()

start()
  .then(() => {
    console.info($t('signal.successComplete'))
  })
  .catch((e: Error) => {
    console.error(e)
    console.error($t('signal.exitWithError'))
  })

process.on('SIGINT', onCancel)

async function start() {
  console.log(`repository addr: ${packageInfo.repository.url.replace(/git\+/g, '')}`)
  console.log(`script version: ${packageInfo.version}`)
  console.log('')
  await argsStore.actions.init()
  const subcommand = argsStore.states.currentCommand.value
  if (subcommand === 'genVoMapper') {
    useGenVoMapperAgg().actions.run(argsStore.states.genVoMapperArgs.value)
  } else if (subcommand === 'none') {
    return
  } else {
    isNever(subcommand)
  }
}
