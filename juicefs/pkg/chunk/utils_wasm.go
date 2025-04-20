/*
 * JuiceFS, Copyright 2020 Juicedata, Inc.
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

package chunk

import (
	"os"
	"time"
)

func getAtime(fi os.FileInfo) time.Time {
	// 在WebAssembly环境中，简单返回修改时间作为访问时间的替代
	return fi.ModTime()
}

func getNlink(fi os.FileInfo) int {
	return 1
}

func getDiskUsage(path string) (uint64, uint64, uint64, uint64) {
	// 在WebAssembly环境中没有真正的磁盘，返回默认值
	// 返回: 总空间, 可用空间, 保留空间, 可用inode (都设为1GB作为默认值)
	const defaultSize uint64 = 1 << 30 // 1GB
	return defaultSize, defaultSize, defaultSize, defaultSize
}

func changeMode(dir string, st os.FileInfo, mode os.FileMode) {
	// 在WebAssembly环境中不支持更改文件模式
}

func inRootVolume(dir string) bool {
	return false
}
