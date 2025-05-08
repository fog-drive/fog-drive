import * as fs from 'node:fs'
import * as path from 'path'
import './wasm_exec.js'

// https://www.sprkweb.dev/en/posts/go-wasm-with-typescript/#create-types-for-typescript
declare global {
  function format(dbUrl: string): void
  function goEchoString(input: string): string
  function add(a: number, b: number): number
}

global.add = function (a: number, b: number): number {
  return a + b
}

/**
 * 初始化JuiceFS WebAssembly模块
 */
export async function initJuicefs(): Promise<void> {
  const go = new global.Go()
  const wasmPath = path.resolve(process.cwd(), 'resources/juicefs.wasm')

  try {
    // 加载并实例化 WASM 模块
    const wasmBinary = fs.readFileSync(wasmPath)
    const wasmModule = await WebAssembly.instantiate(wasmBinary, go.importObject)
    go.run(wasmModule.instance)
    format('sqlite3://juicefs.db')
  } catch (instantiateError) {
    console.error('WASM instantiation error:', instantiateError)
  }
}
