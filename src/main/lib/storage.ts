import * as s3 from './s3'
import * as fs from 'fs'

export function put(path: string): void {
  const stream = fs.createReadStream(path)
  s3.put('aaa.fd', stream)
}
