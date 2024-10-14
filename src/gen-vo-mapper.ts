import { useArgs } from './stores/args'
import * as parser from './utils/parser'
import fs from 'node:fs'
import path from 'node:path'
import { java } from './utils/parser'
import * as StrUtil from './utils/str'
import { accumulate } from './utils/fun'

type OutputJavaFile = {
  filePath: string
  content: string
}
type ParseMap = { [moduleName: string]: java.JavaFileMeta[] }

const argsStore = useArgs()

export default async function () {
  await argsStore.action.init()
  const param = argsStore.state.genVoMapperArgs.value

  //遍历文件夹
  const parseResult = walkJavaFile(path.join(param.projectRoot, param.domainModule))
  let parseMap: ParseMap = {}
  parseMap = parseResult.reduce((map, currentValue) => {
    const regStr = `^${path.join(
      param.projectRoot,
      param.domainModule,
      'src',
      'main',
      'java',
      param.packageName.replace(/\./g, path.sep),
      param.domainModule.replace(/-/g, path.sep)
    )}${path.sep}([a-zA-Z0-9_]+)${path.sep}vo.*$`
    const reg = new RegExp(regStr.replace(/\\/g, '/'))
    const matches = reg.exec(currentValue._filePath.replace(/\\/g, '/'))
    if (!matches) {
      console.warn('匹配失败', currentValue._filePath.replace(/\\/g, '/'), reg)
      return map
    }
    if (!map[matches[1]]) {
      map[matches[1]] = []
    }
    map[matches[1]]!.push(currentValue)
    return map
  }, parseMap)
  // console.warn(JSON.stringify(parseMap, null, 2))
  const genResult = genCode(param.projectRoot, param.packageName, param.outputModule, parseMap)
  writeFile(...genResult)
}

/**
 * 递归遍历java文件
 */
function walkJavaFile(parentPath: string, parseResult: parser.java.JavaFileMeta[] = []): parser.java.JavaFileMeta[] {
  // 读取文件
  const files = fs.readdirSync(parentPath)
  // 遍历文件
  for (const file of files) {
    const filePath = path.join(parentPath, file)
    // 判断是否为文件夹
    if (fs.statSync(filePath).isDirectory()) {
      // 递归调用
      parseResult = walkJavaFile(filePath, parseResult)
      continue
    }
    // 判断是否为java文件
    if (!filePath.endsWith('Vo.java')) {
      continue
    }
    // 读取文件
    const content = fs.readFileSync(filePath, 'utf8')
    parseResult.push(parser.java.parse(filePath, content))
  }
  return parseResult
}

function genCode(projectRoot: string, packageName: string, outputModule: string, parseMap: ParseMap): OutputJavaFile[] {
  const files: OutputJavaFile[] = []
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
        if (!record.name.endsWith('Vo')) {
          return
        }
        const paras = record.formalParameters

        let valueField = undefined
        let fieldIndex = 0
        paras.forEach((p, i) => {
          if (p.name === 'value') {
            valueField = p
            fieldIndex = i
          }
        })
        const canbeMapped = !!valueField
        if (!canbeMapped) {
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
      vo.class_declaration.forEach((c) => {
        if (!c.name.endsWith('Vo')) {
          return
        }
        // TODO 兼容class的值对象
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

function writeFile(...files: OutputJavaFile[]) {
  for (const file of files) {
    if (!fs.existsSync(file.filePath)) {
      fs.mkdirSync(path.dirname(file.filePath), { recursive: true })
    }
    fs.writeFileSync(file.filePath, file.content, 'utf8')
  }
}
