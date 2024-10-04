import { useArgs } from './stores/args'
import * as parser from './utils/parser'
import fs from 'node:fs'
import path from 'node:path'
import { java } from './utils/parser'
import { snakeToUpperCamel } from './utils/common'

type OutputJavaFile = {
  filePath: string
  content: string
}
type ParseMap = Map<String, java.JavaFileMeta[]>

const argsStore = useArgs()

export default async function () {
  await argsStore.action.init()
  const param = argsStore.state.genVoMapperArgs.value

  //遍历文件夹
  const parseResult = walkJavaFile(path.join(param.projectRoot, param.inputModule))
  let parseMap: ParseMap = new Map()
  parseMap = parseResult.reduce((accumulator, currentValue) => {
    const regStr = `^${path.join(
      param.projectRoot,
      param.inputModule,
      'src',
      'main',
      'java',
      param.packageName.replace(/\./g, path.sep),
      param.inputModule.replace(/-/g, path.sep)
    )}${path.sep}([a-zA-Z0-9_]+)${path.sep}vo.*$`
    const reg = new RegExp(regStr.replace(/\\/g, '/'))
    const matches = reg.exec(currentValue._filePath.replace(/\\/g, '/'))
    if (!matches) {
      console.warn('匹配失败', currentValue._filePath.replace(/\\/g, '/'), reg)
      return accumulator
    }
    // console.warn('匹配成功', currentValue._filePath.replace(/\\/g, '/'), reg)
    if (!accumulator.get(matches[1])) {
      accumulator.set(matches[1], [])
    }
    accumulator.get(matches[1])!.push(currentValue)
    return accumulator
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
    const content = fs.readFileSync(filePath, 'utf-8')
    parseResult.push(parser.java.parse(filePath, content))
  }
  return parseResult
}

function genCode(projectRoot: string, packageName: string, outputModule: string, parseMap: ParseMap): OutputJavaFile[] {
  const namespaces = new Map<string, any>()

  const files: OutputJavaFile[] = []
  parseMap.forEach((value, key) => {
    let content = `package ${packageName}.${outputModule.replace(/-/g, '.')}.gen.mapper;

import org.mapstruct.Mapper;

@Mapper
public interface ${snakeToUpperCamel(key)}VoMapper {
    
}
`
    //TODO 注入代码
    for (const m of value) {
      if (m.package_declaration) {
        const reg = new RegExp(`^package\s+${packageName + outputModule.replace(/-/g, '.')}([a-zA-Z0-9_]+)\.vo;$`)
        const matches = reg.exec(m.package_declaration.name)
        if (matches) {
          if (m.record_declaration.length > 0) {
            namespaces.set(matches[1], m.record_declaration)
          } else if (m.class_declaration.length > 0) {
            namespaces.set(matches[1], m.class_declaration)
          }
        }
      }
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
        `${snakeToUpperCamel(key)}VoMapper.java`
      ),
      content,
    })
  })
  return files
}

function writeFile(...files: OutputJavaFile[]) {
  for (const file of files) {
    if (!fs.existsSync(file.filePath)) {
      fs.mkdirSync(path.dirname(file.filePath), { recursive: true })
    }
    fs.writeFileSync(file.filePath, file.content)
  }
}
