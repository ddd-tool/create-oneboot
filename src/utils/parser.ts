import Parser, { SyntaxNode, Tree } from 'tree-sitter'
import javaLanguage from 'tree-sitter-java'
import { forTimes } from './fun'

export namespace java {
  const parser = new Parser()
  parser.setLanguage(javaLanguage)

  export interface JavaFileMeta {
    _filePath: string
    package_declaration?: PackageMeta
    import_declaration: string[]
    class_declaration: ClassMeta[]
    interface_declaration: InterfaceMeta[]
    enum_declaration: EnumMeta[]
    record_declaration: RecordMeta[]
  }
  export interface PackageMeta {
    syntax: $JavaSyntax
    name: string
  }
  export interface RecordMeta {
    syntax: $JavaSyntax
    name: string
    formalParameters: FormalParameterMeta[]
  }
  export interface EnumMeta {
    syntax: $JavaSyntax
    name: string
    staticFields: FieldMeta[]
    fields: FieldMeta[]
  }
  export interface ClassMeta {
    syntax: $JavaSyntax
    name: string
    staticFields: FieldMeta[]
    fields: FieldMeta[]
  }
  export interface InterfaceMeta {
    syntax: $JavaSyntax
    name: string
    staticFields: FieldMeta[]
    fields: FieldMeta[]
  }
  export interface FieldMeta {
    type: string
    name: string
    defaultValue?: string
  }
  export interface FormalParameterMeta {
    syntax: $JavaSyntax
    type: string
    name: string
  }
  export type MethodMeta = {
    name: string
  }
  export function parseTree(content: string): Tree {
    return parser.parse(content)
  }
  export function parse(path: string, content: string): JavaFileMeta {
    const result: JavaFileMeta = {
      _filePath: path,
      package_declaration: undefined,
      import_declaration: [],
      class_declaration: [],
      interface_declaration: [],
      enum_declaration: [],
      record_declaration: [],
    }

    const rootNode = parser.parse(content).rootNode
    const children = rootNode.children
    if (!children) {
      return result
    }
    for (const child of children) {
      if (child.type === $JavaSyntax.package_declaration) {
        result.package_declaration = parsePackageMeta(child)
      } else if (child.type === $JavaSyntax.import_declaration) {
        result.import_declaration.push(findFirstTextBySyntax(child, $JavaSyntax.scoped_identifier))
      } else if (child.type === $JavaSyntax.class_declaration) {
        result.class_declaration.push(parseClassMeta(child))
      } else if (child.type === $JavaSyntax.interface_declaration) {
        result.interface_declaration.push(parseInterfaceMeta(child))
      } else if (child.type === $JavaSyntax.record_declaration) {
        result.record_declaration.push(parseRecordMeta(child))
      }
    }
    return result
  }
  function parsePackageMeta(node: SyntaxNode): PackageMeta {
    const child = node.children.find((ele) => ele.type === $JavaSyntax.scoped_identifier)!
    const result: PackageMeta = {
      syntax: $JavaSyntax.package_declaration,
      name: findFirstTextBySyntax(node, $JavaSyntax.scoped_identifier),
    }
    return result
  }
  function parseClassMeta(node: SyntaxNode): ClassMeta {
    const result: ClassMeta = {
      syntax: $JavaSyntax.class_declaration,
      name: findFirstTextBySyntax(node, $JavaSyntax.identifier),
      staticFields: [],
      fields: [],
    }
    return result
  }
  function parseInterfaceMeta(node: SyntaxNode): InterfaceMeta {
    const result: InterfaceMeta = {
      syntax: $JavaSyntax.interface_declaration,
      name: findFirstTextBySyntax(node, $JavaSyntax.identifier),
      staticFields: [],
      fields: [],
    }
    return result
  }
  function parseRecordMeta(node: SyntaxNode): RecordMeta {
    const result: RecordMeta = {
      syntax: $JavaSyntax.record_declaration,
      name: findFirstTextBySyntax(node, $JavaSyntax.identifier),
      formalParameters: [],
    }
    for (const child of node.children) {
      if (child.type === $JavaSyntax.formal_parameters) {
        const formalParameters = parseFormalParameters(child)
        for (const formalParameter of formalParameters) {
          result.formalParameters.push({
            syntax: $JavaSyntax.formal_parameter,
            type: formalParameter.type,
            name: formalParameter.name,
          })
        }
      }
    }
    return result
  }
  function parseFormalParameters(node: SyntaxNode): FormalParameterMeta[] {
    const result: FormalParameterMeta[] = []
    node.children.forEach((e) => {
      if (e.type !== $JavaSyntax.formal_parameter) {
        return
      }
      result.push({
        syntax: $JavaSyntax.formal_parameter,
        type: findFirstTextBySyntaxes(e, [
          $JavaSyntax.type_identifier,
          $JavaSyntax.identifier,
          $JavaSyntax.generic_type,
        ]),
        name: findFirstTextBySyntax(e, $JavaSyntax.identifier),
      })
    })
    return result
  }
  function findFirstTextBySyntax(node: SyntaxNode, syntax: $JavaSyntax): string {
    return findNodeBySyntax(node, syntax).text
  }
  function findFirstTextBySyntaxes(node: SyntaxNode, syntaxes: NonEmptyArray<$JavaSyntax>): string {
    const results = findNodesBySyntaxes(node, syntaxes)
    if (results.length === 0) {
      throw Error(`not found [${syntaxes.join(', ')}] in ${node.text}`)
    }
    return results[0].text
  }
  function findNodeBySyntax(node: SyntaxNode, syntax: $JavaSyntax): SyntaxNode {
    const child = node.children.find((ele) => ele.type === syntax)
    if (!child) {
      throw Error(`not found [${syntax}] in ${node.text}`)
    }
    return child
  }
  function findNodesBySyntax(node: SyntaxNode, syntax: $JavaSyntax): SyntaxNode[] {
    const children = node.children
    return forTimes(children.length).reduce((acc, index) => {
      if (children[index].type === syntax) {
        acc.push(children[index])
      }
      return acc
    }, [] as SyntaxNode[])
  }
  function findNodesBySyntaxes(node: SyntaxNode, syntaxes: NonEmptyArray<$JavaSyntax>): SyntaxNode[] {
    return forTimes(syntaxes.length).reduce((acc, index) => {
      acc.push(...findNodesBySyntax(node, syntaxes[index]))
      return acc
    }, [] as SyntaxNode[])
  }
}
