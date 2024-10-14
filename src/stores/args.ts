import { readonly, ref } from '@vue/reactivity'
import path from 'node:path'
import fs from 'node:fs'
import prompts from 'prompts'
import { t as $t, updateLang } from '../i18n'
import { Command } from 'commander'
import * as BusinessUtil from '../utils/business'

export enum SubcommandEnum {
  GenVoMapper = 'genVoMapper',
  None = 'none',
}

export type GenVoMapperArgs = {
  projectRoot: string
  packageName: string
  domainModule: string
  outputModule: string
}

const isReady = ref(false)

const genVoMapperCommand = new Command()
  .name('genVoMapper')
  .requiredOption('--project-root <path>', '项目根目录')
  .option('--package-name <name>', '项目根目录', 'com.github.alphafoxz.oneboot')
  .requiredOption('--domain-module <name>', '领域模块名')
  .requiredOption('--output-module <name>', '输出模块名')
  .action((options) => {
    currentCommand.value = SubcommandEnum.GenVoMapper
    genVoMapperArgs.value.projectRoot = options.projectRoot
    genVoMapperArgs.value.packageName = options.packageName
    genVoMapperArgs.value.domainModule = options.domainModule
    genVoMapperArgs.value.outputModule = options.outputModule
  })
const startCommand = new Command().name('start')
const program = new Command()
  .name('oneboot-tool')
  .option('--debug <bool>', '调试模式', false)
  .action((options) => {
    debugMode.value = options.debug
  })
  .addCommand(startCommand)
  .addCommand(genVoMapperCommand)

const currentCommand = ref(SubcommandEnum.None)
const debugMode = ref(false)
const genVoMapperArgs = ref<GenVoMapperArgs>({} as GenVoMapperArgs)

function configArgsFromCommandLine() {
  program.parse(process.argv)
  if (SubcommandEnum.None !== currentCommand.value) {
    isReady.value = true
  }
}
configArgsFromCommandLine()

async function configArgsFromUserChoise() {
  const { langurage } = await prompts(
    [
      {
        name: 'langurage',
        type: 'select',
        message: 'Choose The language during this creation process',
        choices: [
          { title: 'English', value: 'en' },
          { title: '中文', value: 'zh' },
        ],
      },
    ],
    { onCancel: BusinessUtil.onCancel }
  )
  updateLang(langurage)

  const { subcommand } = await prompts(
    [
      {
        name: 'subcommand',
        type: 'select',
        message: $t('question.subcommand'),
        choices: [
          {
            title: $t('question.subcommand.generateVoMapper'),
            value: SubcommandEnum.GenVoMapper,
          },
        ],
      },
    ],
    { onCancel: BusinessUtil.onCancel }
  )
  currentCommand.value = subcommand

  switch (subcommand) {
    case SubcommandEnum.GenVoMapper:
      await configGenVoMapperFromUserChoise()
      break
    default:
  }
}

async function configGenVoMapperFromUserChoise() {
  const defaultProjectRoot = process.cwd() || __dirname
  const { projectRoot } = await prompts(
    [
      {
        name: 'projectRoot',
        type: 'text',
        message: $t('question.projectRoot'),
        initial: `${defaultProjectRoot}`,
        onState: (state) => {
          if (!BusinessUtil.isValidPath(state.value)) {
            BusinessUtil.onError($t('error.badArgs'))
          }
          return state.value
        },
      },
      {
        name: 'packageName',
        type: 'text',
        message: $t('question.packageName'),
        initial: 'com.github.alphafoxz.oneboot',
        onState: (state) => {
          if (!BusinessUtil.isValidPackageName(state.value)) {
            return ''
          }
          return state.value
        },
      },
    ],
    { onCancel: BusinessUtil.onCancel }
  )
  genVoMapperArgs.value.projectRoot = projectRoot

  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    BusinessUtil.onError($t('error.shouldBeValidDir{dir}', { dir: projectRoot }))
  }
  const projectChildren: { title: string; value: string }[] = []
  fs.readdirSync(projectRoot).forEach((i) => {
    if (!i.startsWith('.') && !i.startsWith('_') && fs.statSync(path.join(projectRoot, i)).isDirectory()) {
      projectChildren.push({ title: i, value: i })
    }
  })

  const { domainModule, outputModule } = await prompts(
    [
      {
        name: 'domainModule',
        type: 'select',
        message: $t('question.domainModule'),
        choices: projectChildren,
      },
      {
        name: 'outputModule',
        type: 'select',
        message: $t('question.outputModule'),
        choices: projectChildren,
      },
    ],
    { onCancel: BusinessUtil.onCancel }
  )
  genVoMapperArgs.value.domainModule = domainModule
  genVoMapperArgs.value.outputModule = outputModule
}

async function init() {
  if (isReady.value) {
    return
  }
  await configArgsFromUserChoise()
  isReady.value = true
}

export function useArgs() {
  return {
    state: {
      currentCommand: readonly(currentCommand),
      debugMode: readonly(debugMode),
      genVoMapperArgs: readonly(genVoMapperArgs),
    },
    action: {
      init,
    },
  }
}
