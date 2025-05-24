import { test, expect, describe } from 'vitest'
import { Readable } from 'stream'
import * as crypto from 'crypto'
import { Reader } from '@main/s3/hash/reader'
import { BadDigest, SHA256Mismatch, ErrSizeMismatch } from '@main/s3/hash/errors'

// Test case interface
interface TestCase {
  desc: string
  src: Readable | Reader
  size: number
  actualSize: number
  md5hex: string
  sha256hex: string
  expectError: boolean
  errorType?: typeof BadDigest | typeof SHA256Mismatch | typeof ErrSizeMismatch
  expectedErrorData?: Record<string, string>
}

// Constructor test case
interface ConstructorTestCase {
  desc: string
  src: Readable | Reader
  size: number
  actualSize: number
  md5hex: string
  sha256hex: string
  success: boolean
}

// Helper function to convert string to Readable
function stringToReadable(str: string): Readable {
  return Readable.from(Buffer.from(str))
}

// Helper function similar to mustReader in Go
function mustReader(
  src: Readable,
  size: number,
  md5Hex: string,
  sha256Hex: string,
  actualSize: number
): Reader {
  return Reader.newReader(src, size, md5Hex, sha256Hex, actualSize)
}

describe('Tests functions like Size(), MD5(), SHA256()', () => {
  test('TestHashReaderHelperMethods', async () => {
    const content = 'abcd'
    const md5Hex = 'e2fc714c4727ee9395f324cd2e7f331f'
    const sha256Hex = '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589'

    const r = Reader.newReader(stringToReadable(content), 4, md5Hex, sha256Hex, 4)

    // Read all data (similar to io.Copy to /dev/null)
    const chunks: Buffer[] = []
    for await (const chunk of r) {
      chunks.push(chunk as Buffer)
    }

    expect(r.md5HexString()).toBe(md5Hex)
    expect(r.sha256HexString()).toBe(sha256Hex)
    expect(r.md5Base64String()).toBe('4vxxTEcn7pOV8yTNLn8zHw==')
    expect(r.size()).toBe(4)
    expect(r.actualSize()).toBe(4)

    const expectedMD5 = Buffer.from(md5Hex, 'hex')
    expect(Buffer.compare(r.md5(), expectedMD5)).toBe(0)

    const md5Current = r.md5Current()
    expect(Buffer.compare(md5Current, expectedMD5)).toBe(0)

    const expectedSHA256 = Buffer.from(sha256Hex, 'hex')
    expect(Buffer.compare(r.sha256(), expectedSHA256)).toBe(0)
  })
})

// Test hash reader checksum verification
describe('Test HashReader checksum verification', () => {
  const testCases: TestCase[] = [
    {
      desc: 'Success, no checksum verification provided.',
      src: stringToReadable('abcd'),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '',
      expectError: false
    },
    {
      desc: 'Failure, MD5 mismatch.',
      src: stringToReadable('abcd'),
      size: 4,
      actualSize: 4,
      md5hex: 'd41d8cd98f00b204e9800998ecf8427f',
      sha256hex: '',
      expectError: true,
      errorType: BadDigest,
      expectedErrorData: {
        expectedMD5: 'd41d8cd98f00b204e9800998ecf8427f',
        calculatedMD5: 'e2fc714c4727ee9395f324cd2e7f331f'
      }
    },
    {
      desc: 'Failure, SHA256 mismatch.',
      src: stringToReadable('abcd'),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031580',
      expectError: true,
      errorType: SHA256Mismatch,
      expectedErrorData: {
        expectedSHA256: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031580',
        calculatedSHA256: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589'
      }
    },
    {
      desc: 'Nested hash reader NewReader() should merge.',
      src: mustReader(stringToReadable('abcd'), 4, '', '', 4),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '',
      expectError: false
    },
    {
      desc: 'Incorrect SHA256, nested.',
      src: mustReader(stringToReadable('abcd'), 4, '', '', 4),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '50d858e0985ecc7f60418aaf0cc5ab587f42c2570a884095a9e8ccacd0f6545c',
      expectError: true,
      errorType: SHA256Mismatch,
      expectedErrorData: {
        expectedSHA256: '50d858e0985ecc7f60418aaf0cc5ab587f42c2570a884095a9e8ccacd0f6545c',
        calculatedSHA256: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589'
      }
    },
    {
      desc: 'Correct SHA256, nested.',
      src: mustReader(stringToReadable('abcd'), 4, '', '', 4),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
      expectError: false
    },
    {
      desc: 'Correct SHA256, nested, truncated.',
      src: mustReader(stringToReadable('abcd-more-stuff-to-be ignored'), 4, '', '', 4),
      size: 4,
      actualSize: -1,
      md5hex: '',
      sha256hex: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
      expectError: false
    },
    {
      desc: 'Correct SHA256, nested, truncated, swapped.',
      src: mustReader(stringToReadable('abcd-more-stuff-to-be ignored'), 4, '', '', -1),
      size: 4,
      actualSize: -1,
      md5hex: '',
      sha256hex: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
      expectError: false
    },
    {
      desc: 'Incorrect MD5, nested.',
      src: mustReader(stringToReadable('abcd'), 4, '', '', 4),
      size: 4,
      actualSize: 4,
      md5hex: '0773da587b322af3a8718cb418a715ce',
      sha256hex: '',
      expectError: true,
      errorType: BadDigest,
      expectedErrorData: {
        expectedMD5: '0773da587b322af3a8718cb418a715ce',
        calculatedMD5: 'e2fc714c4727ee9395f324cd2e7f331f'
      }
    },
    {
      desc: 'Correct SHA256, truncated.',
      src: stringToReadable('abcd-morethan-4-bytes'),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
      expectError: false
    },
    {
      desc: 'Correct MD5, nested.',
      src: mustReader(stringToReadable('abcd'), 4, '', '', 4),
      size: 4,
      actualSize: 4,
      md5hex: 'e2fc714c4727ee9395f324cd2e7f331f',
      sha256hex: '',
      expectError: false
    },
    {
      desc: 'Correct MD5, truncated.',
      src: stringToReadable('abcd-morethan-4-bytes'),
      size: 4,
      actualSize: 4,
      md5hex: 'e2fc714c4727ee9395f324cd2e7f331f',
      sha256hex: '',
      expectError: false
    },
    {
      desc: 'Correct MD5, nested, truncated.',
      src: mustReader(stringToReadable('abcd-morestuff'), -1, '', '', -1),
      size: 4,
      actualSize: 4,
      md5hex: 'e2fc714c4727ee9395f324cd2e7f331f',
      sha256hex: '',
      expectError: false
    }
  ]

  testCases.forEach((testCase, i) => {
    test(`Case-${i + 1}: ${testCase.desc}`, async () => {
      let r: Reader | undefined
      let error: Error | undefined = undefined

      try {
        r = Reader.newReader(
          testCase.src,
          testCase.size,
          testCase.md5hex,
          testCase.sha256hex,
          testCase.actualSize
        )

        // 读取所有数据
        const chunks: Buffer[] = []
        for await (const chunk of r) {
          chunks.push(chunk as Buffer)
        }
      } catch (err) {
        error = err as Error
      }

      if (testCase.expectError) {
        expect(error).toBeDefined()
        if (testCase.errorType) {
          expect(error).toBeInstanceOf(testCase.errorType)
        }
        if (testCase.expectedErrorData) {
          for (const [key, value] of Object.entries(testCase.expectedErrorData)) {
            expect((error as Record<string, string>)[key]).toBe(value)
          }
        }
      } else {
        expect(error).toBeUndefined()
      }
    })
  })
})

// Test NewReader() constructor with invalid parameters
describe('Test HashReader invalid parameters', () => {
  const testCases: ConstructorTestCase[] = [
    // {
    //   desc: 'Invalid md5sum, NewReader() will fail.',
    //   src: stringToReadable('abcd'),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: 'invalid-md5',
    //   sha256hex: '',
    //   success: false
    // },
    // {
    //   desc: 'Invalid SHA256, NewReader() will fail.',
    //   src: stringToReadable('abcd'),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: '',
    //   sha256hex: 'invalid-sha256',
    //   success: false
    // },
    {
      desc: 'Nested hash reader, NewReader() should merge.',
      src: mustReader(stringToReadable('abcd'), 4, '', '', 4),
      size: 4,
      actualSize: 4,
      md5hex: '',
      sha256hex: '',
      success: true
    }
    // {
    //   desc: 'Mismatched SHA256',
    //   src: mustReader(
    //     stringToReadable('abcd'),
    //     4,
    //     '',
    //     '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    //     4
    //   ),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: '',
    //   sha256hex: '50d858e0985ecc7f60418aaf0cc5ab587f42c2570a884095a9e8ccacd0f6545c',
    //   success: false
    // },
    // {
    //   desc: 'Correct SHA256',
    //   src: mustReader(
    //     stringToReadable('abcd'),
    //     4,
    //     '',
    //     '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    //     4
    //   ),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: '',
    //   sha256hex: '88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589',
    //   success: true
    // },
    // {
    //   desc: 'Mismatched MD5',
    //   src: mustReader(stringToReadable('abcd'), 4, 'e2fc714c4727ee9395f324cd2e7f331f', '', 4),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: '0773da587b322af3a8718cb418a715ce',
    //   sha256hex: '',
    //   success: false
    // },
    // {
    //   desc: 'Correct MD5',
    //   src: mustReader(stringToReadable('abcd'), 4, 'e2fc714c4727ee9395f324cd2e7f331f', '', 4),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: 'e2fc714c4727ee9395f324cd2e7f331f',
    //   sha256hex: '',
    //   success: true
    // },
    // {
    //   desc: 'No parameters, all good',
    //   src: stringToReadable('abcd'),
    //   size: 4,
    //   actualSize: 4,
    //   md5hex: '',
    //   sha256hex: '',
    //   success: true
    // },
    // {
    //   desc: 'Nested, size mismatch',
    //   src: mustReader(stringToReadable('abcd-morestuff'), 4, '', '', -1),
    //   size: 2,
    //   actualSize: -1,
    //   md5hex: '',
    //   sha256hex: '',
    //   success: false
    // }
  ]

  testCases.forEach((testCase, i) => {
    test(`Case-${i + 1}: ${testCase.desc}`, () => {
      let error: Error | undefined = undefined

      try {
        Reader.newReader(
          testCase.src,
          testCase.size,
          testCase.md5hex,
          testCase.sha256hex,
          testCase.actualSize
        )
      } catch (err) {
        error = err as Error
      }

      if (testCase.success) {
        expect(error).toBeUndefined()
      } else {
        expect(error).toBeDefined()
      }
    })
  })
})
