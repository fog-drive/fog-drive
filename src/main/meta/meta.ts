import {
  DataSource,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  QueryFailedError,
  PrimaryColumn
} from 'typeorm'
import * as _ from 'lodash'
import { StorageModel } from '@shared/models'

export class Meta {
  appMetaEngine: DataSource
  setting: Map<string, string>
  constructor(appMetaEngine: DataSource, setting: Map<string, string>) {
    this.appMetaEngine = appMetaEngine
    this.setting = setting
  }

  // create(parent: number, name: string, ) {

  // }

  saveStorage(storageModel: StorageModel): void {
    const storageEntity = new StorageEntity()
    storageEntity.id = storageModel.id
    storageEntity.name = storageModel.name
    storageEntity.type = storageModel.type
    const { accessKey, secretKey, endpoint, region, bucket } = storageModel
    const values = JSON.stringify({ accessKey, secretKey, endpoint, region, bucket })
    storageEntity.values = values
    this.appMetaEngine
      .getRepository(StorageEntity)
      .upsert(storageEntity, { conflictPaths: ['id'], skipUpdateIfNoValuesChanged: true })
      .catch((error: Error) => {
        if (error instanceof QueryFailedError) {
          console.log(error.message)
        }
      })
  }

  async listStorage(): Promise<StorageModel[]> {
    const result = await this.appMetaEngine.getRepository(StorageEntity).find()
    return result.map((entity) => {
      let model: StorageModel | null = null
      if ('s3' === entity.type) {
        const values = JSON.parse(entity.values)
        model = {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          accessKey: values.accessKey,
          secretKey: values.secretKey,
          endpoint: values.endpoint,
          region: values.region,
          bucket: values.bucket
        }
      }
      return model
    }) as StorageModel[]
  }

  async getStorage(id: number): Promise<StorageModel> {
    const result = await this.appMetaEngine
      .getRepository(StorageEntity)
      .findOne({ where: { id: id } })
    if (null === result) {
      throw 'The data does not exist.'
    }
    return entity2Model(result)
  }

  deleteStorage(id: number): void {
    this.appMetaEngine.getRepository(StorageEntity).delete(id)
  }
}

export async function newMeta(): Promise<Meta> {
  const ds = await new DataSource({
    type: 'sqlite',
    database: '../fd.db',
    logging: true,
    synchronize: true,
    entities: [Setting, StorageEntity, Edge]
  }).initialize()
  const settings = await ds.getRepository(Setting).find()
  const setting = new Map(_.map(settings, (item) => [item.key, item.value]))
  console.log(setting)
  return new Meta(ds, setting)
}

@Entity('fd_storage')
export class StorageEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string

  @Column({ type: 'varchar', length: 255 })
  type: string

  @Column({ type: 'int8', nullable: true })
  quota: number

  @Column({ type: 'varchar', length: 4096 })
  values: string
}

@Entity('fd_setting')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: string

  @Column({ type: 'varchar', length: 4096 })
  value: string
}

@Entity('fd_edge')
@Index(['parent', 'name'], { unique: true })
export class Edge {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'bigint', nullable: false })
  parent: number

  @Column({ type: 'blob', length: 255, nullable: false })
  name: Buffer

  @Column({ type: 'bigint', nullable: false })
  @Index('IDX_fd_edge_inode')
  inode: number

  @Column({ type: 'integer', nullable: false })
  type: number
}

@Entity('fd_node')
export class Node {
  inode: number
}

function entity2Model(entity: StorageEntity): StorageModel {
  const values = JSON.parse(entity.values)
  if ('s3' === entity.type) {
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      endpoint: values.endpoint,
      region: values.region,
      accessKey: values.accessKey,
      secretKey: values.secretKey,
      bucket: values.bucket
    }
  } else {
    throw 'This type is not supported.'
  }
}
