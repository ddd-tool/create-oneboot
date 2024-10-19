import { expect, it } from '@jest/globals'
import Parser from 'tree-sitter'
import javaLanguage from 'tree-sitter-java'

it('tree-sitter 查询dsl例子', () => {
  const code = `/**
  * 用户
  */
 @Builder(toBuilder = true)
 public record UserVo(
         Long id,
         UsernameVo username,
         NicknameVo nickname,
         java.util.Map<String, String> abacAttrs,
         PhoneVo phone,
         UserStatus status,
         OffsetDateTime createTime
 ) {
 }`
  const parser = new Parser()
  parser.setLanguage(javaLanguage)
  const tree = parser.parse(code)
  let result = tree.rootNode.descendantsOfType($JavaSyntax.record_declaration)
  expect(result.length).toBe(1)
  result = result[0].descendantsOfType($JavaSyntax.formal_parameter)
  expect(result.length).toBe(7)
})
