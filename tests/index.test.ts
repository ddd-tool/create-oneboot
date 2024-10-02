import { describe, test } from 'node:test'
import assert from 'node:assert'
import { java } from '../src/utils/parser'

describe('解析java测试', () => {
  test('测试1', () => {
    const code = `package com.github.alphafoxz.oneboot.domain.preset_sys.user.vo;

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
    const result = java.parse(
      'F:/idea_projects/oneboot/domain-preset_sys/src/main/java/com/github/alphafoxz/oneboot/domain/preset_sys/user/vo/EmailVo.java',
      code
    )
    assert(result.record_declaration.length > 0, '未解析出record')
    const record = result.record_declaration[0]
    assert(record.formalParameters.length === 1 && record.formalParameters[0].name === 'value', '未解析出参数')
  })
})
