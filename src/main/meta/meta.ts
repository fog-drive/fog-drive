export class Inode {
  private readonly i: bigint

  static readonly Root = new Inode(1)
  static readonly Trash = new Inode(0x7fffffff10000000n)

  constructor(value: bigint | number) {
    const val = typeof value === 'bigint' ? value : BigInt(value)
    this.i = val
  }

  toString(): string {
    return this.i.toString()
  }

  isValid(): boolean {
    return this.i >= Inode.Root.i
  }

  isTrash(): boolean {
    return this.i >= Inode.Trash.i
  }

  isNormal(): boolean {
    return this.i >= Inode.Root.i && this.i < Inode.Trash.i
  }

  static isTrash(ino: Inode): boolean {
    return ino.i >= Inode.Trash.i
  }

  valueOf(): bigint {
    return this.i
  }
}

export interface Meta {
  name: () => string
  create: (parent: Inode, name: string, uid: number, gid: number) => void
  lookup: (parent: Inode, name: string) => Promise<Inode>
}
