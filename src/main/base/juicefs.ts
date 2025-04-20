import * as fs from 'fs'
import * as path from 'path'
import { is } from '@electron-toolkit/utils'
import { WASI } from 'wasi'

/**
 * 初始化JuiceFS WebAssembly模块（使用WASI方式）
 */
export async function initJuicefs(): Promise<void> {
  try {
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
      wasi_snapshot_preview1: wasi.wasiImport
    }
    
    // 实例化WebAssembly模块
    const instance = await WebAssembly.instantiate(wasmModule, importObject)
    
    // 启动WASI应用
    wasi.start(instance)
    
    console.log('JuiceFS WebAssembly (WASI) initialized successfully')
    
    // 设置juicefsReady状态为true
    global.juicefsReady = true
  } catch (error) {
    console.error('Failed to initialize JuiceFS WebAssembly:', error)
    global.juicefsReady = false
  }
}

/**
 * 检查JuiceFS是否就绪
 */
export function isJuiceFSReady(): boolean {
  return global.juicefsReady === true
}
