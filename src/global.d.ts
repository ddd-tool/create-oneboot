export {}

declare global {
  function isNever(_: never): void
  type I18nMessages = {
    'signal.scriptStart': string
    'signal.successComplete': string
    'signal.exitWithError': string
    'signal.{str}': string
    'question.subcommand': string
    'question.subcommand.generateVoMapper': string
    'question.projectRoot': string
    'question.packageName': string
    'question.domainModule': string
    'question.outputModule': string
    'error.userCancel': string
    'error.invalidArgs{str}': string
    'error.badArgs': string
    'error.shouldBeValidDir{dir}': string
  }
  type NonEmptyArray<T> = [T, ...T[]]
  type ArrayLengthMin<T, N extends number, R extends T[] = []> = R['length'] extends N
    ? [...R, ...T[]]
    : ArrayLengthMin<T, N, [T, ...R]>
  type ArrayLengthMax<T, N extends number, R extends unknown[] = []> = R['length'] extends N
    ? R
    : R | ArrayLengthMax<T, N, [T, ...R]>
  enum $JavaSyntax {
    package_declaration = 'package_declaration',
    import_declaration = 'import_declaration',
    scoped_identifier = 'scoped_identifier',
    class_declaration = 'class_declaration',
    interface_declaration = 'interface_declaration',
    enum_declaration = 'enum_declaration',
    record_declaration = 'record_declaration',
    generic_type = 'generic_type',
    type_identifier = 'type_identifier',
    identifier = 'identifier',
    formal_parameters = 'formal_parameters',
    formal_parameter = 'formal_parameter',
  }
}
