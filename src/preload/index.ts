import { contextBridge, ipcRenderer } from 'electron'
import { SaveStorage, GetStorage, DeleteStorage, Put } from '@shared/types'
import { CSaveStorage, CGetStorage, CDeleteStorage, CPut } from '@shared/channels'

// Custom APIs for renderer

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('context', {
      saveStorage: (...args: Parameters<SaveStorage>) => ipcRenderer.invoke(CSaveStorage, ...args),
      getStorage: (...args: Parameters<GetStorage>) => ipcRenderer.invoke(CGetStorage, ...args),
      deleteStorage: (...args: Parameters<DeleteStorage>) =>
        ipcRenderer.invoke(CDeleteStorage, ...args)
    })
    contextBridge.exposeInMainWorld('object', {
      put: (...args: Parameters<Put>) => ipcRenderer.invoke(CPut, ...args)
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
