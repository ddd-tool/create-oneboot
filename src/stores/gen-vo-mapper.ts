import * as parser from '@/utils/parser'
import { ref } from '@vue/reactivity'
import { createSingletonStore } from 'vue-fn/store'

export type ParseMap = { [moduleName: string]: parser.java.JavaFileMeta[] }
export type InitParam = {}

// ================== 纯函数 ===================
export function isTransient(fieldName: string) {
  return fieldName.startsWith('_')
}

// ================== 数据 ===================
const store = createSingletonStore(() => {
  const voPathRegex = ref<RegExp>()
  return {
    states: {
      voPathRegex,
    },
    actions: {
      setVoPathRegex(reg: RegExp) {
        voPathRegex.value = reg
      },
    },
  }
})

// ================== export api ===================
export function useGenVoMapperStore() {
  return store.api
}
