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
    return { id: entity.id, name: entity.name, type: entity.type }
  }) as StorageModel[]
}

// export const deleteStorage = (): Promise<void> => {
//   dataSource.getRepository(StorageEntity)
// }
