// import { describe, it } from 'node:test'
import { describe, it, expect } from '@jest/globals'
import { java } from '../src/utils/parser'

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

describe('java代码解析测试', () => {
  it('解析record和参数', () => {
    const result = java.parse(
      'F:/idea_projects/oneboot/domain-preset_sys/src/main/java/com/github/alphafoxz/oneboot/domain/preset_sys/user/vo/EmailVo.java',
      code1
    )
    expect(result.record_declaration.length > 0).toBeTruthy()
    const record = result.record_declaration[0]
    expect(record.formalParameters.length === 1 && record.formalParameters[0].name === 'value').toBeTruthy()
  })

  it('解析导包', () => {
    const result = java.parse(
      'F:/idea_projects/oneboot/domain-preset_sys/src/main/java/com/github/alphafoxz/oneboot/OnebootApplication.java',
      code1
    )
    expect(result.import_declaration).toEqual([
      'com.github.alphafoxz.oneboot.core.domain.DomainArgCheckException',
      'com.github.alphafoxz.oneboot.core.toolkit.coding.ReUtil',
    ])
  })
})
