import { DataSource } from 'typeorm'
import { StorageEntity } from './entities'

export const dataSource = new DataSource({
  type: 'sqlite',
  database: '../fd.db',
  logging: true,
  synchronize: true,
  entities: [StorageEntity]
})
