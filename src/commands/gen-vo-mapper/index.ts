import path from 'node:path'
import fs from 'node:fs'
import { useArgsStore } from '@/stores/args'
import * as parser from '@/utils/parser'
import * as StrUtil from '@/utils/str'
import { accumulate } from '@/utils/fun'
import { type FileInfo, writeCodeFile, recursiveFilePath } from '@/utils/io'
import { type ParseMap, useGenVoMapperStore, isTransient } from '@/stores/gen-vo-mapper'
export * from './configure'

const argsStore = useArgsStore()
const store = useGenVoMapperStore()

export async function execGenVoMapper() {
  await argsStore.action.init()
  const param = argsStore.state.genVoMapperArgs.value
  store.action.setVoPathRegex(
    new RegExp(
      '^' +
        path
          .join(
            param.projectRoot,
            param.domainModule,
            'src',
            'main',
            'java',
            param.packageName.replace(/\./g, path.sep),
            param.domainModule.replace(/-/g, path.sep),
            '([a-zA-Z0-9_]+)',
            'vo',
            '.*'
          )
          .replace(/\\/g, '\\\\') +
        '$'
    )
  )

  //遍历文件夹
  const parseResult: parser.java.JavaFileMeta[] = []
  recursiveFilePath(path.join(param.projectRoot, param.domainModule), (path) => {
    if (!path.endsWith('.java') || !store.state.voPathRegex.value!.test(path)) {
      return
    }
    const content = fs.readFileSync(path, 'utf8')
    parseResult.push(parser.java.parse(path, content))
  })
  let parseMap = parseResult.reduce((map, currentValue) => {
    const matches = store.state.voPathRegex.value!.exec(currentValue._filePath)
    if (!matches) {
      console.warn('匹配失败', store.state.voPathRegex.value!, currentValue._filePath)
      return map
    }
    const module = matches[1]
    if (!map[module]) {
      map[module] = []
    }
    map[module]!.push(currentValue)
    return map
  }, {} as ParseMap)
  const genResult = genCode(param.projectRoot, param.packageName, param.outputModule, parseMap)
  writeCodeFile(...genResult)
}

function genCode(projectRoot: string, packageName: string, outputModule: string, parseMap: ParseMap): FileInfo[] {
  const files: FileInfo[] = []
  Object.keys(parseMap).forEach((key) => {
    const vos = parseMap[key]
    const voMapperCode = new VoMapperCode(
      `${packageName}.${outputModule.replace(/-/g, '.')}.gen.mapper`,
      `${StrUtil.snakeToUpperCamel(key)}VoMapper`
    )
    for (const vo of vos) {
      vo.import_declaration.forEach((i) => {
        if (i.endsWith('*')) {
          voMapperCode.addImport(i)
        }
      })
      vo.record_declaration.forEach((record) => {
        const paras = record.formalParameters

        let valueField = undefined
        let fieldIndex = 0
        if (paras.length === 1) {
          valueField = paras[0]
          fieldIndex = 0
        } else {
          paras.forEach((p, i) => {
            if (!isTransient(p.name)) {
              valueField = p
              fieldIndex = i
            }
          })
        }
        if (!valueField) {
          // TODO: 这里提前返回了，应该考虑复杂的对象映射情况
          return
        }
        const fieldsSize = paras.length
        voMapperCode.addImport(vo.package_declaration?.name! + '.' + vo.record_declaration[0].name)
        voMapperCode.addMapping(record.name, {
          fieldType: paras[0].type,
          fieldName: paras[0].name,
          fieldsSize,
          fieldIndex,
        })
      })
      vo.class_declaration.forEach(() => {
        // TODO: 兼容class的值对象
      })
    }
    files.push({
      filePath: path.join(
        projectRoot,
        outputModule,
        'src',
        'main',
        'java',
        packageName.replace(/\./g, path.sep),
        outputModule.replace(/-/g, path.sep),
        'gen',
        'mapper',
        `${StrUtil.snakeToUpperCamel(key)}VoMapper.java`
      ),
      content: voMapperCode.getCode(),
    })
  })
  return files
}
type VoMapperInfo = { fieldType: string; fieldName: string; fieldsSize: number; fieldIndex: number }
class VoMapperCode {
  packageName: string
  ClassName: string
  importPackages: Set<string> = new Set()
  mappings: { [voName: string]: VoMapperInfo } = {}
  constructor(packageName: string, ClassName: string) {
    this.packageName = packageName
    this.ClassName = ClassName
  }
  addImport(packageName: string) {
    this.importPackages.add(packageName)
  }
  addImports(packageNames: string[]) {
    this.importPackages = new Set([...this.importPackages, ...packageNames])
  }
  addMapping(voName: string, mapping: VoMapperInfo) {
    this.mappings[voName] = mapping
  }
  getCode(): string {
    let importsCode = ''
    this.importPackages.forEach((i) => {
      importsCode += `import ${i};\n`
    })
    let mappingsCode = ''
    Object.keys(this.mappings).forEach((voName) => {
      const { fieldType, fieldName, fieldsSize, fieldIndex } = this.mappings[voName]
      const args = accumulate([] as string[], fieldsSize, (accumulator, i) => {
        if (i === fieldIndex) {
          accumulator.push(`source`)
        } else {
          accumulator.push(`null`)
        }
        return accumulator
      }).join(', ')
      mappingsCode += `    default ${fieldType} ${StrUtil.lowerFirst(fieldType)}To${voName}(${voName} source) {
        return source.${fieldName}();
    }

    default ${voName} ${StrUtil.lowerFirst(voName)}To${fieldType}(${fieldType} source) {
        return new ${voName}(${args});
    }
`
    })
    return `package ${this.packageName};

${importsCode}
public interface ${this.ClassName} {
${mappingsCode}
}
`
  }
}
