// SHA256Mismatch - when content sha256 does not match with what was sent from client.
export class SHA256Mismatch extends Error {
  expectedSHA256: string
  calculatedSHA256: string

  constructor(expectedSHA256: string, calculatedSHA256: string) {
    const message = `Bad sha256: Expected ${expectedSHA256} does not match calculated ${calculatedSHA256}`
    super(message)
    this.name = 'SHA256Mismatch'
    this.expectedSHA256 = expectedSHA256
    this.calculatedSHA256 = calculatedSHA256
  }
}

// BadDigest - Content-MD5 you specified did not match what we received.
export class BadDigest extends Error {
  expectedMD5: string
  calculatedMD5: string

  constructor(expectedMD5: string, calculatedMD5: string) {
    const message = `Bad digest: Expected ${expectedMD5} does not match calculated ${calculatedMD5}`
    super(message)
    this.name = 'BadDigest'
    this.expectedMD5 = expectedMD5
    this.calculatedMD5 = calculatedMD5
  }
}

// ErrSizeMismatch error size mismatch
export class ErrSizeMismatch extends Error {
  want: number
  got: number

  constructor(want: number, got: number) {
    const message = `Size mismatch: got ${got}, want ${want}`
    super(message)
    this.name = 'ErrSizeMismatch'
    this.want = want
    this.got = got
  }
}
