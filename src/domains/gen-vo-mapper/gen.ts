import { forTimes } from '@/utils/fun'
import * as StrUtil from '@/utils/str'
import { java as javaParser } from '@/utils/parser'
import path from 'node:path'
import { toInfrastructureMapperPath } from './path'

type SimpleVoMappers = { [voName: string]: MappedField[] }
type DbVoMappers = { [voName: string]: DbVoMapperInfo }
type DbVoMapperInfo = { poMeta: javaParser.JavaFileMeta; voMeta: javaParser.JavaFileMeta }
export type DomainMetaMap = { [moduleName: string]: javaParser.JavaFileMeta[] }
export type MappedField = { index: number; type: string; name: string; isMapped: boolean }

export function isTransientField(fieldName: string) {
  return fieldName.startsWith('_')
}

export class VoMapperCode {
  private packageName: string
  private ClassName: string
  private importPackages: Set<string> = new Set()
  private simpleMappings: SimpleVoMappers = {}
  private dbMappings: DbVoMappers = {}

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
  private getImportsCode(): string {
    let importsCode = ''
    this.importPackages.forEach((i) => {
      importsCode += `import ${i};\n`
    })
    return importsCode
  }
  addSimpleMapping(voName: string, mapping: MappedField[]) {
    this.simpleMappings[voName] = mapping
  }
  addDbMapping(voName: string, poName: DbVoMapperInfo) {
    this.dbMappings[voName] = poName
  }
  private getMappingsCode(): string {
    let mappingsCode = ''
    Object.keys(this.simpleMappings).forEach((voName) => {
      const { type: fieldType, name: fieldName } = this.simpleMappings[voName].find((m) => m.isMapped)!
      const args = this.simpleMappings[voName]
        .map((m) => {
          if (m.isMapped) {
            return `source`
          } else {
            return `null`
          }
        })
        .join(', ')
      mappingsCode += `    default ${fieldType} ${StrUtil.lowerFirst(fieldType)}To${voName}(${voName} source) {
        return source.${fieldName}();
    }

    default ${voName} ${StrUtil.lowerFirst(voName)}To${fieldType}(${fieldType} source) {
        return new ${voName}(${args});
    }
`
    })
    return mappingsCode
  }
  getCode(): string {
    return `package ${this.packageName};

${this.getImportsCode()}
public interface ${this.ClassName} {
${this.getMappingsCode()}
}
`
  }
}

export function genCode(
  projectRoot: string,
  packageName: string,
  outputModule: string,
  parseMap: DomainMetaMap
): FileInfo[] {
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
      // NOTE: 默认只有一个public的record
      if (vo.record_declaration.length === 1) {
        const record = vo.record_declaration[0]
        const paras = record.formalParameters
        let valueField = undefined
        let fieldIndex = 0

        const mappedFields = forTimes(paras.length).reduce(
          (acc, index) => {
            //TODO: 或许可以检测是否有注解
            let isMapped = false
            if (!isTransientField(paras[index].name)) {
              acc.mappedCount++
              isMapped = true
            }
            acc.fields.push({ index, type: paras[index].type, name: paras[index].name, isMapped })
            return acc
          },
          { mappedCount: 0, fields: [] as MappedField[] }
        )
        if (mappedFields.mappedCount === 0) {
          continue
        }
        if (mappedFields.mappedCount === 1) {
          fieldIndex = 0
          const mappedField = mappedFields.fields.find((f) => f.isMapped)
          voMapperCode.addImport(vo.package_declaration?.name! + '.' + vo.record_declaration[0].name)
          voMapperCode.addSimpleMapping(record.name, mappedFields.fields)
        } else {
          paras.forEach((p, i) => {
            if (!isTransientField(p.name)) {
              valueField = p
              fieldIndex = i
            }
          })
        }
        const fieldsSize = paras.length
      } else if (vo.class_declaration.length === 1) {
        // TODO: 兼容class的值对象
      }
    }

    files.push({
      filePath: path.join(
        toInfrastructureMapperPath(projectRoot, outputModule, packageName),
        `${StrUtil.snakeToUpperCamel(key)}VoMapper.java`
      ),
      content: voMapperCode.getCode(),
    })
  })
  return files
}
