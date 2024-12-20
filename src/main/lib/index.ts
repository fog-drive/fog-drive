import { dataSource } from './db'
import { StorageEntity } from './entities'
import { SaveStorage, GetStorage } from '@shared/types'
import { StorageModel } from '@shared/models'
import { QueryFailedError } from 'typeorm'

export const saveStorage: SaveStorage = async (storageModel: StorageModel): Promise<void> => {
  const storageEntity = new StorageEntity()
  storageEntity.id = storageModel.id
  storageEntity.name = storageModel.name
  storageEntity.type = storageModel.type
  const { accessKey, secretKey, endpoint, bucket } = storageModel
  const values = JSON.stringify({ accessKey, secretKey, endpoint, bucket })
  storageEntity.values = values
  dataSource
    .getRepository(StorageEntity)
    .upsert(storageEntity, { conflictPaths: ['id'], skipUpdateIfNoValuesChanged: true })
    .catch((error: Error) => {
      if (error instanceof QueryFailedError) {
        console.log(error.message)
      }
    })
}

export const getStorage: GetStorage = async (): Promise<StorageModel[]> => {
  const result = await dataSource.getRepository(StorageEntity).find()
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
        bucket: values.bucket
      }
    }
    return model
  }) as StorageModel[]
}

export const deleteStorage = async (id: number): Promise<void> => {
  await dataSource.getRepository(StorageEntity).delete(id)
}
