import { AddStorage } from '@shared/types'

declare global {
  interface Window {
    addStorage: AddStorage
  }
}
