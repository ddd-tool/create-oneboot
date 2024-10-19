import fs from 'node:fs'
import path from 'node:path'
import prompts from 'prompts'
import * as BusinessUtil from '@/utils/business'
import { useI18nAgg } from '@/domains/i18n'
import type { GenVoMapperArgs } from '@/domains/args'

const $t = useI18nAgg().actions.t

export async function configGenVoMapperFromUserChoise(): Promise<GenVoMapperArgs> {
  const defaultProjectRoot = process.cwd() || __dirname
  const { projectRoot, packageName } = await prompts(
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

  return {
    projectRoot,
    packageName,
    domainModule,
    outputModule,
  }
}
