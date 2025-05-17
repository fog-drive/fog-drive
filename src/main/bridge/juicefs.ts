import './wasm_exec.js'
import { doLoad } from '@/meta/sql'
import loadWasm from '../../../resources/juicefs.wasm?loader'

declare global {
  function format(dbUrl: string): void
  function goEchoString(input: string): string
  function add(a: number, b: number): number
  const meta: {
    doLoad: () => string
  }
}

global.meta = {
  doLoad: doLoad
}

global.add = function (a: number, b: number): number {
  return a + b
}

/**
 * 初始化JuiceFS WebAssembly模块
 */
export async function initJuicefs(): Promise<void> {
  const go = new global.Go()

  try {
    const instance = await loadWasm(go.importObject)
    go.run(instance)
    format('sqlite3://juicefs.db')
  } catch (instantiateError) {
    console.error('WASM instantiation error:', instantiateError)
  }
}
