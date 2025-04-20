/*
 * JuiceFS, Copyright 2021 Juicedata, Inc.
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

import (
	"strconv"
	"syscall"
	"time"
)

func GetFileInode(path string) (uint64, error) {
	// 在WebAssembly环境中不支持实际的inode
	// 使用文件路径的哈希值作为替代
	var h uint64 = 5381
	for _, c := range path {
		h = (h << 5) + h + uint64(c)
	}
	return h, nil
}

func GetKernelVersion() (major, minor int) {
	// WebAssembly环境中不适用内核版本
	return 1, 0
}

func GetDev(fpath string) int {
	// 在WebAssembly环境中不支持设备ID
	return -1
}

func GetSysInfo() string {
	// 返回WebAssembly相关信息
	return "Platform: WebAssembly/WASI\nTime: " + time.Now().String()
}

func GetUmask() int {
	// WebAssembly环境中不支持umask
	return 0
}

func ErrnoName(err syscall.Errno) string {
	// 简单返回错误码的字符串表示
	return strconv.Itoa(int(err))
}
