import { ref } from '@vue/reactivity'
import { createSingletonAgg } from 'vue-fn/domain'
import enUS from '../locale/en'
import zhCN from '../locale/zh'

export const validLanguages = ['en', 'zh'] as const
export type Language = (typeof validLanguages)[number]

const store = createSingletonAgg(() => {
  const currentLang = ref<Language>('zh')
  const locale = ref<I18nMessages>(enUS)

  function t(key: keyof I18nMessages, defaultValue?: string): string
  function t(key: keyof I18nMessages, attr: Record<string, string | number>, defaultValue?: string): string
  function t(key: keyof I18nMessages, attr1?: string | Record<string, string | number>, attr2?: string): string {
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

  return {
    states: {
      currentLang,
    },
    actions: {
      t,
      setCurrentLang(lang: Language): void {
        if (lang === 'en') {
          locale.value = enUS
        } else if (lang === 'zh') {
          locale.value = zhCN
        } else {
          isNever(lang)
        }
        currentLang.value = lang
      },
    },
  }
})

export function useI18nAgg() {
  return store.api
}
