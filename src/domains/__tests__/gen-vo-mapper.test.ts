import { expect, it } from '@jest/globals'
import { toInfrastructureMapperPath, toInfrastructurePoPath } from '../gen-vo-mapper/path'

it('路径拼接', () => {
  let path = toInfrastructureMapperPath('F:\\idea_projects\\oneboot', 'preset_sys', 'com.github.alphafoxz.oneboot')
  expect(path).toEqual(
    'F:\\idea_projects\\oneboot\\preset_sys\\src\\main\\java\\com\\github\\alphafoxz\\oneboot\\preset_sys\\gen\\mapper'
  )
  path = toInfrastructurePoPath('F:\\idea_projects\\oneboot', 'preset_sys', 'com.github.alphafoxz.oneboot')
  expect(path).toEqual(
    'F:\\idea_projects\\oneboot\\preset_sys\\src\\main\\java\\com\\github\\alphafoxz\\oneboot\\preset_sys\\gen\\jooq\\tables\\pojos'
  )
})
