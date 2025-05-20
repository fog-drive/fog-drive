import * as crypto from 'crypto'
import { Readable } from 'stream'
import { ETag } from './etag'

// Tagger is the interface that wraps the basic ETag method.
export interface Tagger {
  eTag(): ETag | null
}

// WrapReader represents a wrapped reader that implements the Tagger interface
export class WrapReader implements Tagger {
  private tagger: Tagger | null

  constructor(reader: Readable, tagger: Tagger | null) {
    this.tagger = tagger
    // reader is stored but not used directly in this class
  }

  // eTag returns the ETag of the underlying Tagger.
  eTag(): ETag | null {
    if (this.tagger === null) {
      return null
    }
    return this.tagger.eTag()
  }
}

// wrap returns a ReadableStream that reads from the wrapped
// ReadableStream and implements the Tagger interface.
//
// If content implements Tagger then the returned Reader
// returns ETag of the content. Otherwise, it returns
// null as ETag.
//
// wrap provides an adapter for ReadableStream implementations
// that don't implement the Tagger interface.
// It is mainly used to provide a high-level ReadableStream
// access to the ETag computed by a low-level ReadableStream:
//
//   content = new Reader(r.Body, null);
//
//   compressedContent = Compress(content);
//   encryptedContent = Encrypt(compressedContent);
//
//   // Now, we need a ReadableStream that can access
//   // the ETag computed over the content.
//   reader = wrap(encryptedContent, content);
//
export function wrap(wrapped: Readable, content: Readable): Readable & Tagger {
  const reader = wrapped as Readable & Tagger

  if ('eTag' in content && typeof content.eTag === 'function') {
    reader.eTag = (): ETag => (content as unknown as Tagger).eTag()
  } else {
    reader.eTag = (): ETag => null
  }

  return reader
}

// VerifyError is an error signaling that a
// computed ETag does not match an expected ETag.
export class VerifyError extends Error {
  expected: ETag
  computed: ETag

  constructor(expected: ETag, computed: ETag) {
    const message = `etag: expected ETag "${expected?.toString('hex')}" does not match computed ETag "${computed?.toString('hex')}"`
    super(message)
    this.name = 'VerifyError'
    this.expected = expected
    this.computed = computed
  }
}

// Reader wraps a ReadableStream and computes the
// MD5 checksum of the read content as ETag.
//
// Optionally, a Reader can also verify that
// the computed ETag matches an expected value.
// Therefore, it compares both ETags once the
// underlying stream is consumed.
// If the computed ETag does not match the
// expected ETag then it throws a VerifyError.
export class Reader extends Readable implements Tagger {
  private md5!: crypto.Hash
  private checksum!: ETag
  private readN!: number
  private src!: Readable
  private ended: boolean = false

  constructor(src: Readable, etag: ETag) {
    super()

    // If input is already a Reader, try to reuse it
    if (src instanceof Reader) {
      const er = src as Reader
      if (er.readN === 0 && ETag.equal(etag, er.checksum)) {
        return er
      }
    }

    this.src = src
    this.md5 = crypto.createHash('md5')
    this.checksum = etag
    this.readN = 0

    // Handle data events from source
    this.src.on('data', (chunk: Buffer) => {
      this.readN += chunk.length
      this.md5.update(chunk)
      this.push(chunk)
    })

    // Handle end event
    this.src.on('end', () => {
      // Verify checksum when stream ends
      if (this.checksum !== null) {
        const etag = this.eTag()
        if (!ETag.equal(etag, this.checksum)) {
          this.emit('error', new VerifyError(this.checksum, etag))
        }
      }
      this.ended = true
      this.push(null) // signal end of data
    })

    // Forward errors
    this.src.on('error', (err) => {
      this.emit('error', err)
    })
  }

  // eTag returns the ETag of all the content read
  // so far. Reading more content changes the MD5
  // checksum. Therefore, calling eTag multiple
  // times may return different results.
  eTag(): ETag {
    const sum = Buffer.from(this.md5.copy().digest())
    return new ETag(sum)
  }

  // newReader creates a new Reader - static factory method for easier usage
  static newReader(r: Readable, etag: ETag): Reader {
    return new Reader(r, etag)
  }
}
