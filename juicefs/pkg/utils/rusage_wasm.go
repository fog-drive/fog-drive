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

// Rusage is a stub implementation for WASM environments
type Rusage struct {
	// Empty implementation for WASM
}

// GetUtime returns the user time in seconds.
// Since WASM doesn't support syscall.Getrusage, this always returns 0.
func (ru *Rusage) GetUtime() float64 {
	return 0.0
}

// GetStime returns the system time in seconds.
// Since WASM doesn't support syscall.Getrusage, this always returns 0.
func (ru *Rusage) GetStime() float64 {
	return 0.0
}

// GetRusage returns CPU usage of current process.
// Since WASM doesn't support syscall.Getrusage, this returns an empty Rusage struct.
func GetRusage() *Rusage {
	return &Rusage{}
}