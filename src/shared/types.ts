import { StorageModel } from './models'

export type AddStorage = (storageModel: StorageModel) => Promise<void>
