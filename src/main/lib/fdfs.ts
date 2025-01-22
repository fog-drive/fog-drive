import { Meta } from './meta'
import path from 'path'

function string2Buffer(str: string): Uint8Array {
  return Buffer.from(str, 'utf8')
}

const myString = 'Hello, TypeScript!'
const bytes = string2Buffer(myString)
console.log(bytes)

const RootInode = 0

export class FDFS {
  meta: Meta

  constructor(meta: Meta) {
    this.meta = meta
  }

  put(filePath: string) {
    const fileName = path.basename(filePath)

  }


  create() {

  }
}


export function newFDFS(meta: Meta): FDFS {
  console.log(RootInode)
  return new FDFS(meta)
}
