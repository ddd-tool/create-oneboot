import { useArgs } from './stores/args'
import * as parser from './utils/parser'
import fs from 'node:fs'
import path from 'node:path'
import { java } from './utils/parser'

type OutputJavaFile = {
  filePath: string
  content: string
}

const argsStore = useArgs()

export default async function () {
  await argsStore.action.init()
  const param = argsStore.state.genVoMapperArgs.value

  //遍历文件夹
  const parseResult: java.JavaFileMeta[] = []
  walkJavaFile(path.join(param.projectRoot, param.inputModule), parseResult)
  console.warn(JSON.stringify(parseResult, null, 2))
  const genResult = genCode(param.projectRoot, param.packageName, param.outputModule, parseResult)
  writeFile(genResult)
}

/**
 * 递归遍历java文件
 */
function walkJavaFile(path: string, parseResult: parser.java.JavaFileMeta[]): void {
  // 读取文件
  const files = fs.readdirSync(path)
  // 遍历文件
  for (const file of files) {
    const filePath = path + '/' + file
    // 判断是否为文件夹
    if (fs.statSync(filePath).isDirectory()) {
      // 递归调用
      walkJavaFile(filePath, parseResult)
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
}

function genCode(
  projectRoot: string,
  packageName: string,
  outputModule: string,
  meta: java.JavaFileMeta[]
): OutputJavaFile {
  const namespaces = new Map<string, any>()
  for (const m of meta) {
    if (m.package_declaration) {
      const reg = new RegExp(`^package\s+${packageName + outputModule.replace(/-/g, '.')}([a-zA-Z0-9_])+\.vo;$`)
      const matches = reg.exec(m.package_declaration.name)
      if (matches) {
        if (m.record_declaration.length > 0) {
          namespaces.set(matches[0], m.record_declaration)
        } else if (m.class_declaration.length > 0) {
          namespaces.set(matches[0], m.class_declaration)
        }
      }
    }
  }
  let content = `package ${packageName + outputModule.replace(/-/g, '.')};

import org.mapstruct.Mapper;

@Mapper
public interface ${packageName}VoMapper {
    
}
`
  return {
    filePath: path.join(
      projectRoot,
      outputModule,
      'src',
      'main',
      'java',
      packageName.replace(/\./g, '/'),
      outputModule.replace(/-/g, '/'),
      'gen',
      'mapper',
      'VoMapper.java'
    ),
    content,
  }
}

function writeFile(file: OutputJavaFile) {
  if (!fs.existsSync(file.filePath)) {
    fs.mkdirSync(path.dirname(file.filePath), { recursive: true })
  }
  fs.writeFileSync(file.filePath, file.content)
}
