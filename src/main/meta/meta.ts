export class Inode {
  private i: number

  static readonly Root = Inode.valueOf(1)
  static readonly Trash = Inode.valueOf(9000000000000000)
  private constructor(i: number | string) {
    this.i = Number(i)
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

  toNumber(): number {
    return this.i
  }

  static isTrash(ino: Inode): boolean {
    return ino.i >= Inode.Trash.i
  }

  static valueOf(i: number | string): Inode {
    return new Inode(i)
  }
}

export interface Meta {
  name: () => string
  create: (parent: Inode, name: string, uid: number, gid: number) => void
  lookup: (parent: Inode, name: string) => Promise<Inode>
}
