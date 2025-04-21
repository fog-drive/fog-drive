package wasm

import (
  "github.com/juicedata/juicefs/pkg/utils"
	"github.com/juicedata/juicefs/pkg/meta"
)

var logger = utils.GetLogger("juicefs")

func Format() {
	m := meta.NewClient("sqlite3://juicefs.db", nil)
  logger.Info(m)
}