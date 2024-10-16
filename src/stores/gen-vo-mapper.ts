import * as parser from '@/utils/parser'
import { ref, readonly } from '@vue/reactivity'

export type ParseMap = { [moduleName: string]: parser.java.JavaFileMeta[] }
export type InitParam = {}

// ================== 纯函数 ===================
export function isTransient(fieldName: string) {
  return fieldName.startsWith('_')
}

// ================== 数据 ===================
namespace data {
  const voPathRegex = ref<RegExp>()

  export const api = {
    state: {
      voPathRegex: readonly(voPathRegex),
    },
    action: {
      setVoPathRegex(reg: RegExp) {
        voPathRegex.value = reg
      },
    },
  }
}

// ================== export api ===================
export function useGenVoMapperStore() {
  return data.api
}
