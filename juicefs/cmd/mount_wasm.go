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


package cmd

import (
	"github.com/juicedata/juicefs/pkg/meta"
	"github.com/juicedata/juicefs/pkg/object"
	"github.com/juicedata/juicefs/pkg/vfs"
	"github.com/urfave/cli/v2"
)

func mountFlags() []cli.Flag {
	return []cli.Flag{
		&cli.StringFlag{
			Name:  "o",
			Usage: "other mount options",
		},
		&cli.BoolFlag{
			Name:  "read-only",
			Usage: "mount as read-only",
		},
		&cli.Float64Flag{
			Name:  "file-cache-to",
			Value: 0.1,
			Usage: "Cache file attributes in seconds",
		},
		&cli.Float64Flag{
			Name:  "delay-close",
			Usage: "delay file closing in seconds.",
		},
	}
}

func makeDaemon(c *cli.Context, conf *vfs.Config) error {
	logger.Warnf("Cannot run in background in WebAssembly environment.")
	return nil
}

func makeDaemonForSvc(c *cli.Context, m meta.Meta, metaUrl, listenAddr string) error {
	logger.Warnf("Cannot run in background in WebAssembly environment.")
	return nil
}

func getDaemonStage() int {
	return 0
}

func mountMain(v *vfs.VFS, c *cli.Context) {
	logger.Infof("Mounting in WebAssembly environment")
	// 在WASM环境中实现挂载逻辑

}

func checkMountpoint(name, mp, logPath string, background bool) {}

func prepareMp(mp string) {}

func setFuseOption(c *cli.Context, format *meta.Format, vfsConf *vfs.Config) {
	// WASM环境不支持FUSE，但可以设置一些特定于WASM的选项
	vfsConf.WasmOptions = &vfs.WasmOptions{
		ReadOnly:    c.Bool("read-only"),
		FileCache:   c.Float64("file-cache-to"),
		DelayClose:  c.Float64("delay-close"),
		ExtraOpts:   c.String("o"),
	}
}

func launchMount(mp string, conf *vfs.Config) error { return nil }

func installHandler(mp string, v *vfs.VFS, blob object.ObjectStorage) {
	// 在WASM环境中设置必要的事件处理程序
	v.SetupWasmHandlers()
}
