export type LangType = 'zh' | 'en'
export type DictType = {
  'signal.scriptStart': string
  'signal.successComplete': string
  'signal.exitWithError': string
  'question.message.subcommand': string
  'question.message.subcommand.generateVoMapper': string
  'question.message.projectRoot': string
  'question.message.packageName': string
  'question.message.inputModule': string
  'question.message.outputModule': string
  'error.userCancel': string
  'error.invalidArgs': string
  'error.badArgs': string
  'error.business': string
}
