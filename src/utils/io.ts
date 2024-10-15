import fs from 'node:fs'
import path from 'node:path'

export type FileInfo = {
  filePath: string
  content: string
}

export function writeCodeFile(...files: FileInfo[]) {
  for (const file of files) {
    if (!fs.existsSync(file.filePath)) {
      fs.mkdirSync(path.dirname(file.filePath), { recursive: true })
    }
    fs.writeFileSync(file.filePath, file.content, 'utf8')
  }
}

export function recursiveReadFile(currentPath: string): FileInfo[] {
  const result: FileInfo[] = []
  const files = fs.readdirSync(currentPath)
  for (const file of files) {
    const childPath = path.join(currentPath, file)
    if (fs.statSync(childPath).isDirectory()) {
      result.push(...recursiveReadFile(childPath))
      continue
    }
    result.push({
      filePath: childPath,
      content: fs.readFileSync(childPath, 'utf8'),
    })
  }
  return result
}

export function recursiveFilePath(currentPath: string, callback: (filePath: string) => void): void {
  const files = fs.readdirSync(currentPath)
  for (const file of files) {
    const childPath = path.join(currentPath, file)
    if (fs.statSync(childPath).isDirectory()) {
      recursiveFilePath(childPath, callback)
      continue
    }
    callback(childPath)
  }
}
