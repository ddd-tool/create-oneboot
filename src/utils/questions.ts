import prompts from 'prompts'
import lang from '../lang'
import common from './common'
import path from 'node:path'

const t = lang.action.t
const updateLang = lang.action.updateLang

type BusinessType = {
  businessType?: string
}

export async function configArgsFromUserChoise(): Promise<typeof result> {
  console.log(process.cwd())
  const defaultPrefix = path.basename(process.cwd()) || path.basename(__dirname)
  const { lang } = await prompts(
    [
      {
        name: 'lang',
        type: 'select',
        message: 'Choose The language during this creation process',
        choices: [
          { title: 'English', value: 'en' },
          { title: '中文', value: 'zh' },
        ],
      },
    ],
    { onCancel: common.action.onCancel }
  )
  updateLang(lang)

  const result: BusinessType = await prompts(
    [
      {
        name: 'businessType',
        type: 'select',
        message: t('question.message.businessType'),
        choices: [
          { title: 'English', value: 'en' },
          { title: '中文', value: 'zh' },
        ],
      },
      // {
      //   name: 'prefix',
      //   type: 'text',
      //   message: t('question.message.prefix'),
      //   initial: `/${defaultPrefix}`,
      //   onState: (state) => {
      //     if (!state.value || /(\s|\/|\\)+/.test(state.value)) {
      //       return ''
      //     }
      //     return state.value
      //   },
      // },
    ],
    { onCancel: common.action.onCancel }
  )
  return result
}
