import { SaveStorage, GetStorage, Put } from '@shared/types'

declare global {
  interface Window {
    context: {
      saveStorage: SaveStorage
      getStorage: GetStorage
      deleteStorage: DeleteStorage
    }
    object: {
      put: Put
    }
  }
}
