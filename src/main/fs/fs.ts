import { Meta, Inode } from '@/meta'
import path from 'path'
import _ from 'lodash'

// todo:
export class File {
  path: string
  inode: Inode
  fs: FileSystem

  constructor(path: string, inode: Inode, fs: FileSystem) {
    this.path = path
    this.inode = inode
    this.fs = fs
  }

  public write(b: Buffer): void {
    console.log(b)
  }
}

export class FileSystem {
  meta: Meta

  constructor(meta: Meta) {
    this.meta = meta
  }

  public create(p: string): File {
    if (_.endsWith(p, '/')) {
      // throw syscall.exception('EINVAL')
    }
    const parent = Inode.Root
    this.meta.create(parent, p, 1, 1)
    const basename = path.basename(p)
    const i = this.resolve(p)

    return new File(p, new Inode(i), this)
  }


  private resolve(p: string): Inode {
    return this.doResolve(p)
  }

  private doResolve(p: string): Inode {
    const ss = _.split(p, '/')
    for (const [i, name] of ss.entries()) {
      if (_.size(name) === 0) {
        continue
      }

      let resolved: boolean = false
      if (i === _.size(ss) - 1) {
        resolved = true
      }

      if (resolved) {
        return Inode.Root
      }
      this.doResolve(p)
    }

    return Inode.Root
  }

  private lookup(parent: Inode, name: string): Inode {
    this.meta.lookup(parent, name)
    return Inode.Root
  }
}

export function newFileSystem(meta: Meta): FileSystem {
  console.log(Inode.Root)
  return new FileSystem(meta)
}
