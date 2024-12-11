import { AddStorage, GetStorage } from '@shared/types'

declare global {
  interface Window {
    context: {
      addStorage: AddStorage
      getStorage: GetStorage
    }
  }
}
