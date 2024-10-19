import path from 'node:path'

export function toJavaModulePath(projectRootPath: string, moduleName: string, packageName: string): string {
  return path.join(
    projectRootPath,
    moduleName,
    'src',
    'main',
    'java',
    packageName.replace(/\./g, path.sep),
    moduleName.replace(/-/g, path.sep)
  )
}
export function toInfrastructurePoPath(projectRootPath: string, moduleName: string, packageName: string): string {
  return path.join(toJavaModulePath(projectRootPath, moduleName, packageName), 'gen', 'jooq', 'tables', 'pojos')
}
export function toInfrastructureMapperPath(projectRootPath: string, moduleName: string, packageName: string): string {
  return path.join(toJavaModulePath(projectRootPath, moduleName, packageName), 'gen', 'mapper')
}
