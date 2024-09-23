import zhDict from './zh'
import enDict from './en'
import { LangType, DictType } from './define'
import { ref } from '../utils/reactive'

const currentDict = ref<DictType>(enDict)
function t(key: keyof DictType, defaultValue?: string): string
function t(key: keyof DictType, attr: Record<string, string | number>, defaultValue?: string): string
function t(key: keyof DictType, attr1?: string | Record<string, string | number>, attr2?: string): string {
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

function updateLang(lang: LangType) {
  if (lang === 'zh') {
    currentDict.value = zhDict
  } else if (lang === 'en') {
    currentDict.value = enDict
  }
}

export default {
  state: {},
  action: {
    t,
    updateLang,
  },
}
