import { Readable } from 'stream'
import * as crypto from 'crypto'
import { ETag } from '../etag/etag'
import { BadDigest, SHA256Mismatch, ErrSizeMismatch } from './errors'

// A Reader wraps an io.Reader and computes the MD5 checksum
// of the read content as ETag. Optionally, it also computes
// the SHA256 checksum of the content.
//
// If the reference values for the ETag and content SHA256
// are not empty then it will check whether the computed
// match the reference values.
export class Reader extends Readable {
  private src: Readable
  private bytesRead: number = 0
  private _size: number
  private _actualSize: number
  private checksum: ETag
  private contentSHA256: Buffer
  private _sha256: crypto.Hash | null

  /**
   * Constructor - for internal use only, external code should use the newReader static method
   */
  protected constructor(
    src: Readable,
    size: number,
    checksum: ETag,
    contentSHA256: Buffer,
    actualSize: number = -1,
    sha256: crypto.Hash | null = null
  ) {
    super({ objectMode: false })
    this.src = src
    this._size = size
    this._actualSize = actualSize
    this.checksum = checksum
    this.contentSHA256 = contentSHA256
    this._sha256 = sha256

    this.setupDataHandling()
  }

  /**
   * NewReader returns a new Reader that wraps src and computes
   * MD5 checksum of everything it reads as ETag.
   *
   * It also computes the SHA256 checksum of everything it reads
   * if sha256Hex is not the empty string.
   *
   * If size resp. actualSize is unknown at the time of calling
   * NewReader then it should be set to -1.
   *
   * NewReader may try merge the given size, MD5 and SHA256 values
   * into src - if src is a Reader - to avoid computing the same
   * checksums multiple times.
   */
  public static newReader(
    src: Readable,
    size: number,
    md5Hex: string,
    sha256Hex: string,
    actualSize: number = -1
  ): Reader {
    const md5 = Buffer.from(md5Hex, 'hex')
    if (md5Hex !== md5.toString('hex')) {
      throw new BadDigest(md5Hex, '') // TODO(aead): Return an error that indicates that an invalid ETag has been specified
    }

    const sha256 = Buffer.from(sha256Hex, 'hex')
    if (sha256Hex !== sha256.toString('hex')) {
      throw new SHA256Mismatch(sha256Hex, '') // TODO(aead): Return an error that indicates that an invalid Content-SHA256 has been specified
    }

    // Merge the size, MD5 and SHA256 values if src is a Reader.
    // The size may be set to -1 by callers if unknown.
    if (src instanceof Reader) {
      const r = src as Reader
      if (r.bytesRead > 0) {
        throw new Error('hash: already read from hash reader')
      }

      if (
        r.checksum.getData.length !== 0 &&
        md5.length !== 0 &&
        !ETag.equal(r.checksum, new ETag(md5))
      ) {
        throw new BadDigest(r.checksum.getData().toString('hex'), md5Hex)
      }

      if (
        r.contentSHA256.length !== 0 &&
        sha256.length !== 0 &&
        !(Buffer.compare(r.contentSHA256, sha256) === 0)
      ) {
        throw new SHA256Mismatch(r.contentSHA256.toString('hex'), sha256Hex)
      }

      if (r._size >= 0 && size >= 0 && r._size !== size) {
        throw new ErrSizeMismatch(r._size, size)
      }

      r.checksum = new ETag(md5)
      r.contentSHA256 = sha256

      if (r._size < 0 && size >= 0) {
        r._size = size
      }

      if (r._actualSize <= 0 && actualSize >= 0) {
        r._actualSize = actualSize
      }

      return r
    }

    // For non-Reader type src, create a new Reader
    let hash: crypto.Hash | null = null
    if (sha256.length !== 0) {
      hash = crypto.createHash('sha256')
    }

    return new Reader(src, size, new ETag(md5), sha256, actualSize, hash)
  }

  /**
   * Set up data handling for the stream
   */
  private setupDataHandling(): void {
    // Handle the Readable stream
    this.src.on('data', (chunk: Buffer) => {
      this.bytesRead += chunk.length

      if (this._sha256) {
        this._sha256.update(chunk)
      }

      // Limit the size if needed
      if (this._size >= 0 && this.bytesRead > this._size) {
        const allowedChunk = chunk.slice(0, chunk.length - (this.bytesRead - this._size))
        this.push(allowedChunk)
        this.src.destroy()
      } else {
        // Push data to the output stream
        this.push(chunk)
      }
    })

    this.src.on('end', () => {
      // Verify SHA256 if set
      if (this._sha256 && this.contentSHA256.length > 0) {
        const sum = this._sha256.digest()
        if (!(Buffer.compare(this.contentSHA256, sum) === 0)) {
          this.emit(
            'error',
            new SHA256Mismatch(this.contentSHA256.toString('hex'), sum.toString('hex'))
          )
          return
        }
      }
      // Mark the end of the stream
      this.push(null)
    })

    this.src.on('error', (err: Error) => {
      this.emit('error', err)
    })
  }

  // Override Readable's _read method
  _read(/* size */): void {
    // Implementation is done through event handlers,
    // no additional operation needed here
    if (this.src.isPaused()) {
      this.src.resume()
    }
  }

  /**
   * Size returns the absolute number of bytes the Reader
   * will return during reading. It returns -1 for unlimited
   * data.
   */
  size(): number {
    return this._size
  }

  /**
   * ActualSize returns the pre-modified size of the object.
   * DecompressedSize - For compressed objects.
   */
  actualSize(): number {
    return this._actualSize
  }

  /**
   * ETag returns the ETag computed by an underlying etag.Tagger.
   * If the underlying io.Reader does not implement etag.Tagger
   * it returns null.
   */
  eTag(): ETag | null {
    // If the source implements ETag support, get the ETag
    if (this.checksum.getData().length > 0) {
      return new ETag(this.checksum.getData())
    }
    return null
  }

  /**
   * MD5 returns the MD5 checksum set as reference value.
   *
   * It corresponds to the checksum that is expected and
   * not the actual MD5 checksum of the content.
   * Therefore, refer to MD5Current.
   */
  md5(): Buffer {
    return this.checksum.getData()
  }

  /**
   * MD5Current returns the MD5 checksum of the content
   * that has been read so far.
   *
   * Calling MD5Current again after reading more data may
   * result in a different checksum.
   */
  md5Current(): Buffer {
    const etag = this.eTag()
    if (etag) {
      return Buffer.from(etag.string(), 'hex')
    }
    return this.checksum.getData()
  }

  /**
   * SHA256 returns the SHA256 checksum set as reference value.
   *
   * It corresponds to the checksum that is expected and
   * not the actual SHA256 checksum of the content.
   */
  sha256(): Buffer {
    return this.contentSHA256
  }

  /**
   * MD5HexString returns a hex representation of the MD5.
   */
  md5HexString(): string {
    return this.checksum.getData().toString('hex')
  }

  /**
   * MD5Base64String returns a base64 representation of the MD5.
   */
  md5Base64String(): string {
    return this.checksum.getData().toString('base64')
  }

  /**
   * SHA256HexString returns a hex representation of the SHA256.
   */
  sha256HexString(): string {
    return this.contentSHA256.toString('hex')
  }

  /**
   * Close and release resources.
   */
  close(): void {
    this.destroy()
  }
}
