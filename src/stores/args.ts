import { ref } from '../utils/reactive'
import lang from '../lang'
import path from 'node:path'
import fs from 'node:fs'
import prompts from 'prompts'
import { Command } from 'commander'
import { onCancel, onError, isValidPath, isValidPackageName } from '../utils/common'

export enum SubcommandEnum {
  GenVoMapper = 'genVoMapper',
  None = 'none',
}
type Args = {
  nonInteractive: boolean
}

export type GenVoMapperArgs = {
  projectRoot: string
  packageName: string
  inputModule: string
  outputModule: string
}

const t = lang.action.t
const isReady = ref(false)

const genVoMapperCommand = new Command()
  .name('genVoMapper')
  .requiredOption('--project-root <path>', '项目根目录')
  .option('--package-name <name>', '项目根目录', 'com.github.alphafoxz.oneboot')
  .requiredOption('--input-module <name>', '输入模块名')
  .requiredOption('--output-module <name>', '输出模块名')
  .action((options) => {
    currentCommand.value = SubcommandEnum.GenVoMapper
    genVoMapperArgs.value.projectRoot = options.projectRoot
    genVoMapperArgs.value.packageName = options.packageName
    genVoMapperArgs.value.inputModule = options.inputModule
    genVoMapperArgs.value.outputModule = options.outputModule
  })
const startCommand = new Command().name('start')
const program = new Command().name('oneboot-tool').addCommand(startCommand).addCommand(genVoMapperCommand)
const currentCommand = ref(SubcommandEnum.None)
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
    { onCancel }
  )
  lang.action.updateLang(langurage)

  const { subcommand } = await prompts(
    [
      {
        name: 'subcommand',
        type: 'select',
        message: t('question.subcommand'),
        choices: [
          {
            title: t('question.subcommand.generateVoMapper'),
            value: SubcommandEnum.GenVoMapper,
          },
        ],
      },
    ],
    { onCancel }
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
  const defaultPrefix = path.basename(process.cwd()) || path.basename(__dirname)
  const { projectRoot } = await prompts(
    [
      {
        name: 'projectRoot',
        type: 'text',
        message: t('question.projectRoot'),
        initial: `/${defaultPrefix}`,
        onState: (state) => {
          if (!isValidPath(state.value)) {
            onError(t('error.badArgs'))
          }
          return state.value
        },
      },
      {
        name: 'packageName',
        type: 'text',
        message: t('question.packageName'),
        initial: 'com.github.alphafoxz.oneboot',
        onState: (state) => {
          if (!isValidPackageName(state.value)) {
            return ''
          }
          return state.value
        },
      },
    ],
    { onCancel }
  )
  genVoMapperArgs.value.projectRoot = projectRoot

  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    throw Error(t('error.badArgs'))
  }
  fs.existsSync(projectRoot)
  fs.statSync(projectRoot)
  fs.readdirSync(projectRoot)

  const { inputModule, outputModule } = await prompts(
    [
      {
        name: 'inputModule',
        type: 'select',
        message: t('question.inputModule'),
        choices: [
          {
            title: t('question.subcommand.generateVoMapper'),
            value: 'genVo',
          },
        ],
      },
      {
        name: 'outputModule',
        type: 'select',
        message: t('question.outputModule'),
        choices: [
          {
            title: t('question.subcommand.generateVoMapper'),
            value: 'genVo',
          },
        ],
      },
    ],
    { onCancel }
  )
  genVoMapperArgs.value.inputModule = inputModule
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
      currentCommand,
      genVoMapperArgs,
    },
    action: {
      init,
    },
  }
}
