export type LangType = 'zh' | 'en'
export type DictType = {
  'signal.scriptStart': string
  'signal.successComplete': string
  'signal.exitWithError': string
  'question.subcommand': string
  'question.subcommand.generateVoMapper': string
  'question.projectRoot': string
  'question.packageName': string
  'question.inputModule': string
  'question.outputModule': string
  'error.userCancel': string
  'error.invalidArgs': string
  'error.badArgs': string
  'error.business': string
}
