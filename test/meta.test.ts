import { expect, test } from 'vitest'
import { Edge, Setting, Node, Slice, StorageEntity, Ino } from '@main/meta'
import { DataSource } from 'typeorm'

async function getDataSource(): Promise<DataSource> {
  return await new DataSource({
    type: 'sqlite',
    database: '../fd_test.db',
    synchronize: true,
    logging: true,
    entities: [Setting, StorageEntity, Edge, Node, Slice]
  }).initialize()
}

test('test typeorm', async () => {
  const edgeRepository = (await getDataSource()).getRepository(Edge)
  const edge1 = new Edge()
  edge1.id = 1
  edge1.name = Buffer.from('/')
  edge1.parent = Ino.valueOf(1)
  edge1.inode = Ino.valueOf(1)
  edge1.type = 2
  console.log(edge1)
  await edge1.save()

  const edge2 = new Edge()
  edge2.id = 2
  edge2.name = Buffer.from('test')
  edge2.parent = Ino.valueOf(1)
  edge2.type = 1
  edge2.inode = Ino.valueOf(2)
  await edge2.save()

  const edge = await edgeRepository
    .createQueryBuilder('edge')
    .where('edge.parent = :parent AND edge.name = :name', {
      parent: 1,
      name: Buffer.from('test')
    })
    .getOne()
  console.log(edge)
})
