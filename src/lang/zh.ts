import { DictType } from './define'

const zhDict: DictType = {
  'signal.scriptStart': '===== 脚本开始执行 =====',
  'signal.successComplete': '===== 脚本执行成功 =====',
  'signal.exitWithError': '===== 脚本异常退出 =====',
  'question.subcommand': '请选择要执行的业务类型',
  'question.subcommand.generateVoMapper': '生成 VO 映射',
  'question.projectRoot': '请输入工程根目录',
  'question.packageName': '请输入包名',
  'question.inputModule': '请选择输入模块名',
  'question.outputModule': '请选择目标模块名',
  'error.userCancel': '用户终止了脚本执行',
  'error.invalidArgs': '无效的参数: {str}',
  'error.badArgs': '错误的参数',
  'error.business': '错误: {str}',
}

export default zhDict
