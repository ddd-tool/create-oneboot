import { ref } from '@vue/reactivity'
import prompts from 'prompts'
import { t as $t, updateLang } from '@/i18n'
import { Command } from 'commander'
import * as BusinessUtil from '@/utils/business'
import { configGenVoMapperFromUserChoise } from '@/commands/gen-vo-mapper/configure'
import { createApi } from 'vue-fn/store'

// ======================= 纯函数 =======================
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

namespace data {
  const isReady = ref(false)
  const currentCommand = ref(SubcommandEnum.None)
  const debugMode = ref(false)

  // ===================== 生成 vo mapper 命令 =====================
  const genVoMapperArgs = ref<GenVoMapperArgs>({} as GenVoMapperArgs)
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

  // ===================== 配置参数 =====================
  const startCommand = new Command().name('start')
  const program = new Command()
    .name('oneboot-tool')
    .option('--debug <bool>', '调试模式', false)
    .action((options) => {
      debugMode.value = options.debug
    })
    .addCommand(startCommand)
    .addCommand(genVoMapperCommand)
  // .addCommand(genTableMapperCommand)

  function configArgsFromCommandLine() {
    program.parse(process.argv)
    if (SubcommandEnum.None !== currentCommand.value) {
      isReady.value = true
    }
  }
  configArgsFromCommandLine()

  // ===================== 初始化 =====================
  async function init() {
    if (isReady.value) {
      return
    }
    await configArgsFromUserChoise()
    isReady.value = true
  }
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

    const result = await prompts(
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

    const subcommand = result.subcommand as SubcommandEnum
    currentCommand.value = subcommand

    if (subcommand === SubcommandEnum.GenVoMapper) {
      genVoMapperArgs.value = await configGenVoMapperFromUserChoise()
    } else if (subcommand === SubcommandEnum.None) {
    } else {
      isNever(subcommand)
    }
  }
  export const api = createApi({
    state: {
      currentCommand,
      debugMode,
      genVoMapperArgs,
    },
    action: {
      init,
    },
  })
}

// ==================== 导出api =====================
export function useArgsStore() {
  return data.api
}
