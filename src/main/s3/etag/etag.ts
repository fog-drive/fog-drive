import * as crypto from 'crypto'

// ETag is a single S3 ETag.
//
// An S3 ETag sometimes corresponds to the MD5 of
// the S3 object content. However, when an object
// is encrypted, compressed or uploaded using
// the S3 multipart API then its ETag is not
// necessarily the MD5 of the object content.
//
// For a more detailed description of S3 ETags
// take a look at the package documentation.
export class ETag {
  private data: Buffer

  constructor(data: Buffer) {
    this.data = data
  }

  // String returns the string representation of the ETag.
  //
  // The returned string is a hex representation of the
  // binary ETag with an optional '-<part-number>' suffix.
  public string(): string {
    if (this.isMultipart()) {
      const md5Part = this.data.slice(0, 16).toString('hex')
      const suffix = this.data.slice(16).toString()
      return md5Part + suffix
    }
    return this.data.toString('hex')
  }

  // IsEncrypted reports whether the ETag is encrypted.
  public isEncrypted(): boolean {
    return this.data.length > 16 && !new TextDecoder().decode(this.data).includes('-')
  }

  // IsMultipart reports whether the ETag belongs to an
  // object that has been uploaded using the S3 multipart
  // API.
  // An S3 multipart ETag has a -<part-number> suffix.
  public isMultipart(): boolean {
    return this.data.length > 16 && new TextDecoder().decode(this.data).includes('-')
  }

  // Parts returns the number of object parts that are
  // referenced by this ETag. It returns 1 if the object
  // has been uploaded using the S3 singlepart API.
  //
  // Parts may panic if the ETag is an invalid multipart
  // ETag.
  public parts(): number {
    if (!this.isMultipart()) {
      return 1
    }

    const dashIndex = this.data.indexOf(Buffer.from('-')[0])
    const partsStr = this.data.slice(dashIndex + 1).toString()
    const parts = parseInt(partsStr, 10)

    if (isNaN(parts)) {
      throw new Error('格式错误的 ETag')
    }

    return parts
  }

  // ETag returns the ETag itself.
  //
  // By providing this method ETag implements
  // the Tagger interface.
  public etag(): ETag {
    return this
  }

  // FromContentMD5 decodes and returns the Content-MD5
  // as ETag, if set. If no Content-MD5 header is set
  // it returns an empty ETag and no error.
  public static fromContentMD5(headers: Record<string, string | string[]>): ETag | null {
    const contentMD5 = headers['Content-MD5'] || headers['content-md5']
    if (!contentMD5) {
      return null
    }

    const value = Array.isArray(contentMD5) ? contentMD5[0] : contentMD5
    if (!value) {
      throw new Error('etag: content-md5 已设置但不包含值')
    }

    try {
      const buffer = Buffer.from(value, 'base64')
      if (buffer.length !== 16) {
        // MD5 size is always 16 bytes
        throw new Error('etag: 无效的 content-md5')
      }
      return new ETag(buffer)
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : 'unknown error'
      throw new Error(`etag: 无效的 base64 编码: ${errorMessage}`)
    }
  }

  // Multipart computes an S3 multipart ETag given a list of
  // S3 singlepart ETags. It returns nil if the list of
  // ETags is empty.
  //
  // Any encrypted or multipart ETag will be ignored and not
  // used to compute the returned ETag.
  public static multipart(etags: ETag[]): ETag | null {
    if (etags.length === 0) {
      return null
    }

    let n = 0
    const hash = crypto.createHash('md5')

    for (const etag of etags) {
      if (!etag.isMultipart() && !etag.isEncrypted()) {
        hash.update(etag.data)
        n++
      }
    }

    const md5Sum = hash.digest()
    const suffix = Buffer.from(`-${n}`)
    return new ETag(Buffer.concat([md5Sum, suffix]))
  }

  // Set adds the ETag to the HTTP headers. It overwrites any
  // existing ETag entry.
  //
  // Due to legacy S3 clients, that make incorrect assumptions
  // about HTTP headers, Set should be used instead of
  // http.Header.Set(...). Otherwise, some S3 clients will not
  // able to extract the ETag.
  public static set(etag: ETag, headers: Record<string, string | string[]>): void {
    // Some (broken) S3 clients expect the ETag header to
    // literally "ETag" - not "Etag". Further, some clients
    // expect an ETag in double quotes. Therefore, we set the
    // ETag directly as map entry instead of using http.Header.Set
    headers['ETag'] = `"${etag.toString()}"`
  }

  // Get extracts and parses an ETag from the given HTTP headers.
  // It returns an error when the HTTP headers do not contain
  // an ETag entry or when the ETag is malformed.
  //
  // Get only accepts AWS S3 compatible ETags - i.e. no
  // encrypted ETags - and therefore is stricter than Parse.
  public static get(headers: Record<string, string | string[]>): ETag {
    const strict = true
    let etagHeader = headers['Etag'] || headers['etag']

    if (!etagHeader) {
      etagHeader = headers['ETag']
    }

    if (!etagHeader) {
      throw new Error('etag: HTTP header does not contain an ETag')
    }

    const value = Array.isArray(etagHeader) ? etagHeader[0] : etagHeader
    return this.parse(value, strict)
  }

  /**
   * Equal returns true if and only if the two ETags are identical.
   */
  public static equal(a: ETag, b: ETag): boolean {
    return Buffer.compare(a.data, b.data) === 0
  }

  // parse parse s as an S3 ETag, returning the result.
  // It operates in one of two modes:
  //  - strict
  //  - non-strict
  //
  // In strict mode, parse only accepts ETags that
  // are AWS S3 compatible. In particular, an AWS
  // S3 ETag always consists of a 128 bit checksum
  // value and an optional -<part-number> suffix.
  // Therefore, s must have the following form in
  // strict mode:  <32-hex-characters>[-<integer>]
  //
  // In non-strict mode, parse also accepts ETags
  // that are not AWS S3 compatible - e.g. encrypted
  // ETags.
  public static parse(s: string, strict = false): ETag {
    // An S3 ETag may be a double-quoted string.
    // Therefore, we remove double quotes at the
    // start and end, if any.
    if (s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1)
    }

    // An S3 ETag may be a multipart ETag that
    // contains a '-' followed by a number.
    // If the ETag does not a '-' is is either
    // a singlepart or encrypted ETag.
    const dashIndex = s.indexOf('-')

    if (dashIndex === -1) {
      const buffer = Buffer.from(s, 'hex')

      if (strict && buffer.length !== 16) {
        throw new Error(`etag: invalid length ${buffer.length}`)
      }

      return new ETag(buffer)
    }

    const prefix = s.substring(0, dashIndex)
    const suffix = s.substring(dashIndex)

    if (prefix.length !== 32) {
      throw new Error(`etag: invalid prefix length ${prefix.length}`)
    }

    if (suffix.length <= 1) {
      throw new Error('etag: suffix is not a part number')
    }

    const md5Buffer = Buffer.from(prefix, 'hex')
    const partNumber = parseInt(suffix.substring(1), 10) // suffix[0] == '-' Therefore, we start parsing at suffix[1]
    if (strict && (partNumber === 0 || partNumber > 10000)) {
      throw new Error(`etag: invalid part number ${partNumber}`)
    }
    return new ETag(Buffer.concat([md5Buffer, Buffer.from(suffix)]))
  }
}
