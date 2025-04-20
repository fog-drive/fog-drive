//go:build !wasm
// +build !wasm

package cmd

import (
	"github.com/erikdubbelboer/gspt"
)

// setProcTitle 在普通操作系统上设置进程标题
func setProcTitle(title string) {
	gspt.SetProcTitle(title)
}
