import type { Messages } from '../define'

const zhDict: Messages = {
  'signal.{str}': '错误: {str}',
  'signal.scriptStart': '===== 脚本开始执行 =====',
  'signal.successComplete': '===== 脚本执行成功 =====',
  'signal.exitWithError': '===== 脚本异常退出 =====',
  'question.subcommand': '请选择要执行的业务类型',
  'question.subcommand.generateVoMapper': '生成 VO 映射',
  'question.projectRoot': '请输入工程根目录',
  'question.packageName': '请输入包名',
  'question.domainModule': '请选择领域模块',
  'question.outputModule': '请选择输出模块',
  'error.userCancel': '用户终止了脚本执行',
  'error.invalidArgs{str}': '无效的参数: {str}',
  'error.badArgs': '错误的参数',
  'error.shouldBeValidDir{dir}': '{dir} 应该是一个有效的目录',
}

export default zhDict
