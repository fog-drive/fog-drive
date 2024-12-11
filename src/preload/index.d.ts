import { SaveStorage, GetStorage } from '@shared/types'

declare global {
  interface Window {
    context: {
      saveStorage: SaveStorage
      getStorage: GetStorage
    }
  }
}
