/**
 * JuiceFS WebAssembly WASI 全局变量声明
 */

// 全局的JuiceFS就绪标志
declare global {
  // eslint-disable-next-line no-var
  var juicefsReady: boolean
}

export {}
