import zhDict from './zh'
import enDict from './en'
import { ref } from '../utils/reactive'
import type { I18nDict, I18nLang } from './define'

const currentDict = ref(enDict)
function t(key: keyof I18nDict, defaultValue?: string): string
function t(key: keyof I18nDict, attr: Record<string, string | number>, defaultValue?: string): string
function t(key: keyof I18nDict, attr1?: string | Record<string, string | number>, attr2?: string): string {
  let v = currentDict.value[key]
  if (!v) {
    if (typeof attr1 === 'string') {
      v = attr1
    } else if (typeof attr2 === 'string') {
      v = attr2
    }
  }
  if (!v) {
    return ''
  }
  if (typeof attr1 === 'object') {
    v = v.replace(/\{\s*([a-zA-z_]+)\s*\}/g, (_, name) => {
      return String(attr1[name])
    })
  }
  return v
}

function updateLang(lang: I18nLang): void {
  if (lang === 'zh') {
    currentDict.value = zhDict
  } else if (lang === 'en') {
    currentDict.value = enDict
  }
}

export { t, updateLang }
