import { describe, it, expect } from '@jest/globals'
import { java } from '../parser'

describe('java代码解析测试1', () => {
  const code1 = `package com.github.alphafoxz.oneboot.domain.preset_sys.user.vo;
  import com.github.alphafoxz.oneboot.core.domain.DomainArgCheckException;
  import com.github.alphafoxz.oneboot.core.toolkit.coding.ReUtil;
  
  /**
   * 电子邮箱
   */
  public record EmailVo(String value) {
      public EmailVo {
          if (!ReUtil.isMatch("\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}", value)) {
              throw new DomainArgCheckException("电子邮箱格式不正确");
          }
      }
  }
  `

  it('解析record和参数', () => {
    const result = java.parse(
      'F:/idea_projects/oneboot/domain-preset_sys/src/main/java/com/github/alphafoxz/oneboot/domain/preset_sys/user/vo/EmailVo.java',
      code1
    )
    expect(result.record_declaration[0].name).toEqual('EmailVo')
    const record = result.record_declaration[0]
    expect(result.record_declaration[0].formalParameters.length).toEqual(1)
    expect(record.formalParameters[0].name).toEqual('value')
  })

  it('解析导包', () => {
    const result = java.parse('D:/Demo.java', code1)
    expect(result.import_declaration).toEqual([
      'com.github.alphafoxz.oneboot.core.domain.DomainArgCheckException',
      'com.github.alphafoxz.oneboot.core.toolkit.coding.ReUtil',
    ])
  })
})

describe('java代码解析测试2', () => {
  const code2 = `/**
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

  it('解析record和参数', () => {
    const result = java.parse(
      'F:/idea_projects/oneboot/domain-preset_sys/src/main/java/com/github/alphafoxz/oneboot/domain/preset_sys/user/vo/EmailVo.java',
      code2
    )
    expect(result.record_declaration[0].name).toEqual('UserVo')
    const record = result.record_declaration[0]
    expect(result.record_declaration[0].formalParameters.length).toEqual(7)
    expect(record.formalParameters[0].name).toEqual('id')
  })
})
