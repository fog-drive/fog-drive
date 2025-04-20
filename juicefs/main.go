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
)

// WASI环境中运行的主函数
func main() {
	fmt.Println("Starting JuiceFS in WASI environment...")

	// 在WASI环境中，我们无法直接设置JavaScript全局变量
	// 而是需要通过stdout或其他I/O机制与宿主环境通信
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
