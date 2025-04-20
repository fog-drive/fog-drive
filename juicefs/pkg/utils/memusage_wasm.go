//go:build wasm && !windows
// +build wasm,!windows

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

// MemoryUsage returns virtual and resident memory usage for WASM environment.
// Since WASM doesn't support syscall.Getrusage or direct access to process stats,
// this implementation returns 0 for both values.
func MemoryUsage() (virt, rss uint64) {
	// WASM environment doesn't support memory usage reporting via syscalls
	// Return zeros as fallback
	return 0, 0
}