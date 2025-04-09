import * as _ from 'lodash'
import { Inode, Meta } from './meta'
import { DataSource } from 'typeorm'
import { Edge, newEngine } from './sql'

export class DefaultMeta implements Meta {
  engine: DataSource
  constructor(engine: DataSource) {
    this.engine = engine
  }

  public static async newDefaultMeta(): Promise<DefaultMeta> {
    return new DefaultMeta(await newEngine())
  }
  name(): string {
    return 'default'
  }
  create(parent: Inode, name: string, uid: number, gid: number): void {
    console.log(parent, name, uid, gid)
  }
  async lookup(parent: Inode, name: string): Promise<Inode> {
    console.log(parent, name)
    let inode: Inode
    const edge = await this.engine
      .getRepository(Edge)
      .createQueryBuilder('edge')
      .where('edge.parent = :parent AND edge.name = :name', {
        parent: parent.valueOf(),
        name: name
      })
      .getOne()
    if (null === edge) {
      throw new Error('ENOENT')
    } else {
      inode = edge.inode
    }
    return Promise.resolve(inode)
  }
}
