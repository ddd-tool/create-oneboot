import Parser, { SyntaxNode, Tree } from 'tree-sitter'
import javaLanguage from 'tree-sitter-java'

export namespace java {
  enum Grammar {
    class_declaration = 'class_declaration',
    interface_declaration = 'interface_declaration',
    enum_declaration = 'enum_declaration',
    record_declaration = 'record_declaration',
    identifier = 'identifier',
    formal_parameters = 'formal_parameters',
    formal_parameter = 'formal_parameter',
  }
  export interface JavaFileMeta {
    class_declaration: ClassMeta[]
    interface_declaration: InterfaceMeta[]
    enum_declaration: EnumMeta[]
    record_declaration: RecordMeta[]
  }
  export interface RecordMeta {
    grammar: Grammar
    name: string
    formalParameters: FormalParameterMeta[]
  }
  export interface EnumMeta {
    grammar: Grammar
    name: string
    staticFields: FieldMeta[]
    fields: FieldMeta[]
  }
  export interface ClassMeta {
    grammar: Grammar
    name: string
    staticFields: FieldMeta[]
    fields: FieldMeta[]
  }
  export interface InterfaceMeta {
    grammar: Grammar
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
    grammar: Grammar
    name: string
  }
  export type MethodMeta = {
    name: string
  }
  const parser = new Parser()
  parser.setLanguage(javaLanguage)

  export function parseTree(content: string): Tree {
    return parser.parse(content)
  }
  export function parse(content: string): JavaFileMeta {
    const result: JavaFileMeta = {
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
      if (child.type === Grammar.class_declaration) {
        result.class_declaration.push(parseClassMeta(child, content))
      } else if (child.type === Grammar.interface_declaration) {
        result.interface_declaration.push(parseInterfaceMeta(child, content))
      } else if (child.type === Grammar.record_declaration) {
        result.record_declaration.push(parseRecordMeta(child, content))
      }
    }
    return result
  }

  function parseClassMeta(node: SyntaxNode, content: string): ClassMeta {
    const result: ClassMeta = {
      grammar: Grammar.class_declaration,
      name: findName(node, content),
      staticFields: [],
      fields: [],
    }
    return result
  }

  function parseInterfaceMeta(node: SyntaxNode, content: string): InterfaceMeta {
    const result: InterfaceMeta = {
      grammar: Grammar.interface_declaration,
      name: findName(node, content),
      staticFields: [],
      fields: [],
    }
    return result
  }

  function parseRecordMeta(node: SyntaxNode, content: string): RecordMeta {
    const result: RecordMeta = {
      grammar: Grammar.record_declaration,
      name: findName(node, content),
      formalParameters: [],
    }
    for (const child of node.children) {
      if (child.type === Grammar.formal_parameters) {
        const formalParameters = parseFormalParameters(child, content)
        for (const formalParameter of formalParameters) {
          result.formalParameters.push({
            grammar: Grammar.formal_parameter,
            name: formalParameter.name,
          })
        }
      }
    }
    return result
  }

  function parseFormalParameters(node: SyntaxNode, content: string): FormalParameterMeta[] {
    const result: FormalParameterMeta[] = []
    node.children.forEach((e) => {
      if (e.type !== Grammar.formal_parameter) {
        return
      }
      result.push({
        grammar: Grammar.formal_parameter,
        name: findName(e, content),
      })
    })
    return result
  }

  function findName(node: SyntaxNode, content: string): string {
    for (const child of node.namedChildren) {
      if (child.type === Grammar.identifier) {
        return content.substring(child.startIndex, child.endIndex)
      }
    }
    return ''
  }
}
