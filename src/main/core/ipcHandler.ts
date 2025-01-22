import { newFDFS } from '@/lib/fdfs'
import { newMeta } from '@/lib/meta'
import { CSaveStorage, CGetStorage, CDeleteStorage, CPut } from '@shared/channels'
import { SaveStorage, GetStorage, DeleteStorage, Put } from '@shared/types'
import { ipcMain } from 'electron'
import path from 'path'
import * as fs from 'fs'

export async function init(): Promise<void> {
  const meta = await newMeta()
  newFDFS(meta)

  ipcMain.handle(CSaveStorage, (_, ...args: Parameters<SaveStorage>) => meta.saveStorage(...args))
  ipcMain.handle(CGetStorage, (_, ...args: Parameters<GetStorage>) => meta.listStorage(...args))
  ipcMain.handle(CDeleteStorage, (_, ...args: Parameters<DeleteStorage>) =>
    meta.deleteStorage(...args)
  )
  ipcMain.handle(CPut, (_, ...args: Parameters<Put>) => putObject(...args))
}

const BLK_SIZE = 1024 * 1024

export function putObject(filePath: string): void {
  const fileName = path.basename(filePath)
  const rs = fs.createReadStream(filePath, { highWaterMark: BLK_SIZE })
}
