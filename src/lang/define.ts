export type LangType = 'zh' | 'en'
export type DictType = {
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
