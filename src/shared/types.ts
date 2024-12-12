import { StorageModel } from './models'

export type SaveStorage = (storageModel: StorageModel) => Promise<void>
export type GetStorage = () => Promise<StorageModel[]>
export type DeleteStorage = (id: number) => Promise<void>
