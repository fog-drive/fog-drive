import { dataSource } from './db'
import { StorageEntity } from './entities'
import { AddStorage, GetStorage } from '@shared/types'
import { StorageModel } from '@shared/models'
import { QueryFailedError } from 'typeorm'

export const addStorage: AddStorage = async (storageModel: StorageModel): Promise<void> => {
  const storageEntity = new StorageEntity()
  storageEntity.name = storageModel.name
  storageEntity.type = storageModel.type
  const { accessKey, secretKey, endpoint, bucket } = storageModel
  const values = JSON.stringify({ accessKey, secretKey, endpoint, bucket })
  storageEntity.values = values
  dataSource
    .getRepository(StorageEntity)
    .save(storageEntity)
    .catch((error: Error) => {
      if (error instanceof QueryFailedError) {
        console.log(error.message)
      }
    })
}

export const getStorage: GetStorage = async (): Promise<StorageModel[]> => {
  const result = await dataSource.getRepository(StorageEntity).find()
  const m = result.map((entity) => {
    return { name: entity.name, type: entity.type }
  })
  console.log(m)
  return m
}
