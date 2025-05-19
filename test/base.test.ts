import { test } from 'vitest'
import { upload } from '@main/lib/base'

test('upload', () => {
  upload('vitest.config.ts')
})
