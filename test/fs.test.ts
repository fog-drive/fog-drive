import { expect, test } from 'vitest'
import { DefaultMeta } from '@main/meta'

test('adds 1 + 2 to equal 3', () => {
  DefaultMeta.newDefaultMeta()
  const myString = 'Hello, TypeScript!'
  const bytes = string2Buffer(myString)
  console.log(bytes)
})

function string2Buffer(str: string): Uint8Array {
  return Buffer.from(str, 'utf8')
}
