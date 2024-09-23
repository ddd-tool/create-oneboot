export type Args = {
  /**
   * 非交互脚本
   */
  '--non-interactive': boolean | string
}

export const defaultArgsVal: Args = {
  '--non-interactive': false,
}
