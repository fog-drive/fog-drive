import fs from 'fs'
import { Readable } from 'stream'

export function upload(filepath: string): void {
  if (!fs.existsSync(filepath)) {
    throw new Error(`文件不存在: ${filepath}`)
  }
  const reader: Readable = fs.createReadStream(filepath, {})
  reader.on('data', (chunk) => {
    console.log('文件读取流:', chunk)
  })

  reader.on('end', () => {
    console.log('文件读取完成')
  })

  reader.on('error', (err) => {
    console.error('文件读取错误:', err)
  })
}
