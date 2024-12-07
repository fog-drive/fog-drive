import { contextBridge, ipcRenderer } from 'electron'
import { AddStorage } from '@shared/types'
import { CAddStore } from '@shared/channels'

// Custom APIs for renderer


// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('context', {
      addStorage: (...args: Parameters<AddStorage>) => {
        ipcRenderer.invoke(CAddStore, args)
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
