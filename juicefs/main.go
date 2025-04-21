/*
 * JuiceFS, Copyright 2022 Juicedata, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"fmt"
	"os"

  "github.com/juicedata/juicefs/wasm"
)

//go:wasmexport init
func init() {
  wasm.Format()
}

//go:wasmimport electron ten
//go:noescape
func ten() int32

// 主函数，在 WebAssembly 环境中自动被调用
func main() {
	fmt.Println("Starting JuiceFS in WASI environment...")
	fmt.Println("ten() = ", ten())
	fmt.Println("JUICEFS_READY")

	// 在实际应用中，这里会包含更多逻辑，如读取命令行参数等
	args := os.Args
	if len(args) > 1 {
		fmt.Printf("Arguments: %v\n", args[1:])
	}

	// 在WASI环境中，程序正常退出即可
	// 宿主环境会处理WebAssembly实例的生命周期
	fmt.Println("JuiceFS initialized successfully")
}
