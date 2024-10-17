import { ref } from '@vue/reactivity'
import { createSingletonApi } from 'vue-fn/store'
import type { Messages } from '../define'
import enUS from '../locale/en'

export const validLanguages = ['en', 'zh'] as const
export type Language = (typeof validLanguages)[number]

namespace data {
  const currentLang = ref<Language>('zh')
  const locale = ref<Messages>(enUS)

  function t(key: keyof Messages, defaultValue?: string): string
  function t(key: keyof Messages, attr: Record<string, string | number>, defaultValue?: string): string
  function t(key: keyof Messages, attr1?: string | Record<string, string | number>, attr2?: string): string {
    let v = locale.value[key]
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

  export const api = createSingletonApi({
    state: {
      currentLang,
    },
    action: {
      t,
      setCurrentLang(lang: Language): void {
        currentLang.value = lang
      },
    },
  })
}

export function useI18nStore() {
  return data.api
}
