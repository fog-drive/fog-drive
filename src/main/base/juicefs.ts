import * as fs from 'fs'
import * as path from 'path'
import { is } from '@electron-toolkit/utils'
import { WASI } from 'node:wasi'

export async function initJuicefs(): Promise<void> {
  // 避免重复初始化
  if (global.juicefsReady && global.juicefsInstance) {
    console.log('JuiceFS WebAssembly already initialized')
    return
  }

  // 确定资源目录路径
  const resourcesPath = is.dev
    ? path.join(process.cwd(), 'resources')
    : path.join(process.resourcesPath, 'resources')

  // juicefs.wasm 路径
  const wasmPath = path.join(resourcesPath, 'juicefs.wasm')

  // 检查文件是否存在
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WebAssembly file not found at ${wasmPath}`)
  }

  console.log('Loading JuiceFS WebAssembly using WASI from:', wasmPath)

  // 创建WASI实例，配置环境和参数
  const wasi = new WASI({
    version: 'preview1',
    args: ['juicefs'],
    env: process.env,
    preopens: {
      '/': '/' // 预打开根目录，使WASI程序可以访问文件系统
    }
  })

  // 加载WebAssembly模块
  const wasmBuffer = fs.readFileSync(wasmPath)

  // 编译WebAssembly模块
  const wasmModule = await WebAssembly.compile(wasmBuffer)

  // 创建导入对象，包含WASI API
  const importObject = {
    wasi_snapshot_preview1: wasi.wasiImport,
    electron: {
      ten: (): number => {
        return 10
      }
    }
  }

  try {
    // 实例化WebAssembly模块
    const instance = await WebAssembly.instantiate(wasmModule, importObject)

    // 获取并暴露add方法
    if (instance.exports.init && typeof instance.exports.init === 'function') {
      global.init = instance.exports.init as () => void
      console.log('JuiceFS WebAssembly init function is available')
    } else {
      console.warn('JuiceFS WebAssembly init function not found in exports')
    }

    wasi.initialize(instance)
    global.init()
    console.log('JuiceFS WebAssembly initialization completed')
  } catch (error) {
    console.error('Failed to instantiate JuiceFS WebAssembly module:', error)
    throw error
  }
}

export function init(): void {
  return global.init()
}
