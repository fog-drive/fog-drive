import * as fs from 'node:fs'
import * as path from 'path'
import './wasm_exec.js'

// 为Node.js环境定义全局对象
declare global {
  function format(dbUrl: string): void
  function goEchoString(input: string): string
}

/**
 * 初始化JuiceFS WebAssembly模块
 */
export async function initJuicefs(): Promise<void> {
  const go = new global.Go()
  console.log('Go instance created')
  const wasmPath = path.resolve(process.cwd(), 'resources/juicefs.wasm')

  try {
    // 加载并实例化 WASM 模块
    const wasmBinary = fs.readFileSync(wasmPath)

    const wasmModule = await WebAssembly.instantiate(wasmBinary, go.importObject)
    go.run(wasmModule.instance)
    format('sqlite://juicefs.db')
  } catch (instantiateError) {
    console.error('WASM instantiation error:', instantiateError)
  }
}
