//go:build  wasm
// +build wasm

/*
 * JuiceFS, Copyright 2023 Juicedata, Inc.
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

package utils

// 这个文件提供了一个空实现，以在JavaScript/WASM环境中替代syscall.Statfs相关功能

// Statfs_t是为了在WASM环境中兼容syscall.Statfs_t而存在的结构体
type Statfs_t struct {
	Type    int64
	Bsize   int64
	Blocks  uint64
	Bfree   uint64
	Bavail  uint64
	Files   uint64
	Ffree   uint64
	Fsid    int64
	Namelen int64
}

// Statfs是为了在WASM环境中兼容syscall.Statfs而存在的函数
func Statfs(path string, buf *Statfs_t) error {
	// WASM环境下不实际执行任何操作，仅提供接口兼容
	return nil
}