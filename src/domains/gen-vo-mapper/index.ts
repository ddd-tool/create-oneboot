import { java as javaParser } from '@/utils/parser'
import { reactive, ref } from '@vue/reactivity'
import { createSingletonAgg } from 'vue-fn/domain'
import { useArgsAgg } from '@/domains/args'
import { recursiveFiles, writeCodeFile } from '@/utils/io'
import path from 'node:path'
import fs from 'node:fs'
import { type DomainMetaMap, genCode } from './gen'
import { toInfrastructurePoPath, toJavaModulePath } from './path'

// ================== 引入其他领域 ===================
const argsAgg = useArgsAgg()

// ================== 聚合 ===================
const agg = createSingletonAgg(() => {
  const domainVoPathRegex = ref<RegExp>()
  const domainFilesMeta = reactive<javaParser.JavaFileMeta[]>([])
  const infrastructureFilesMeta = reactive<javaParser.JavaFileMeta[]>([])

  function run(param: typeof argsAgg.states.genVoMapperArgs.value) {
    domainVoPathRegex.value = new RegExp(
      '^' +
        path
          .join(
            toJavaModulePath(param.projectRoot, param.domainModule, param.packageName),
            '([a-zA-Z0-9_]+)',
            'vo',
            '.*'
          )
          .replace(/\\/g, '\\\\') +
        '$'
    )
    //遍历领域模块
    recursiveFiles(toJavaModulePath(param.projectRoot, param.domainModule, param.packageName), (path) => {
      if (!path.endsWith('.java') || !domainVoPathRegex.value!.test(path)) {
        return
      }
      const content = fs.readFileSync(path, 'utf8')
      domainFilesMeta.push(javaParser.parse(path, content))
    })
    //遍历实施模块
    recursiveFiles(toInfrastructurePoPath(param.projectRoot, param.outputModule, param.packageName), (path) => {
      if (!path.endsWith('.java')) {
        return
      }
      const content = fs.readFileSync(path, 'utf8')
      infrastructureFilesMeta.push(javaParser.parse(path, content))
    })
    const parseMap = domainFilesMeta.reduce((map, currentValue) => {
      const matches = domainVoPathRegex.value!.exec(currentValue._filePath)
      if (!matches) {
        throw Error('匹配失败: ' + domainVoPathRegex.value! + currentValue._filePath)
      }
      const module = matches[1]
      if (!map[module]) {
        map[module] = []
      }
      map[module]!.push(currentValue)
      return map
    }, {} as DomainMetaMap)
    const genResult = genCode(param.projectRoot, param.packageName, param.outputModule, parseMap)
    writeCodeFile(...genResult)
  }

  return {
    states: {},
    actions: {
      run,
    },
  }
})

// ================== export api ===================
export function useGenVoMapperAgg() {
  return agg.api
}
