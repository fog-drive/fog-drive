import {
  BaseEntity,
  Column,
  DataSource,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  ValueTransformer,
  EntityManager
} from 'typeorm'
import { Inode } from './meta'

/**
 * todo:
 * typeorm does not native support bigint
 * refer to: https://github.com/typeorm/typeorm/issues/4179#issuecomment-719524661
 * refer to: https://github.com/typeorm/typeorm/issues/3136#issuecomment-1489736686
 */

export const newEngine = async (): Promise<DataSource> => {
  const engine = await new DataSource({
    type: 'sqlite',
    database: '../fd.db',
    synchronize: true,
    logging: true,
    entities: [
      Setting,
      StorageEntity,
      Edge,
      Node,
      Slice,
      Counter,
      Chunk,
      SliceRef,
      Delslices,
      Symlink,
      Xattr,
      Flock,
      Plock,
      Session,
      Session2,
      Sustained,
      Delfile,
      DirStats,
      DirQuota,
      DetachedNode,
      Acl
    ]
  }).initialize()
  return engine
}

const inoTransformer: ValueTransformer = {
  to: (value: Inode) => {
    return value.toNumber().toString()
  },
  from: (value: string) => {
    return Inode.valueOf(value)
  }
}

@Entity('fd_storage')
export class StorageEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string

  @Column({ type: 'varchar', length: 255 })
  type!: string

  @Column({ type: 'int8', nullable: true })
  quota?: number

  @Column({ type: 'varchar', length: 4096 })
  values!: string
}

@Entity('fd_setting')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key!: string

  @Column({ type: 'varchar', length: 4096 })
  value!: string
}

@Entity('fd_counter')
export class Counter {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'bigint', nullable: false })
  value!: number
}

@Entity('fd_edge')
@Index(['parent', 'name'], { unique: true })
export class Edge extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false, transformer: inoTransformer })
  parent!: Inode

  @Column({ type: 'blob', length: 255, nullable: false })
  name!: Buffer

  @Index('IDX_fd_edge_inode')
  @Column({ type: 'bigint', nullable: true, transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'integer', nullable: false })
  type!: number
}

@Entity('fd_node')
export class Node {
  @PrimaryColumn({ type: 'bigint', transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'integer', nullable: false })
  type!: number

  @Column({ type: 'integer', nullable: false })
  flags!: number

  @Column({ type: 'integer', nullable: false })
  mode!: number

  @Column({ type: 'integer', nullable: false })
  uid!: number

  @Column({ type: 'integer', nullable: false })
  gid!: number

  @Column({ type: 'bigint', nullable: false })
  atime!: number

  @Column({ type: 'bigint', nullable: false })
  mtime!: number

  @Column({ type: 'bigint', nullable: false })
  ctime!: number

  @Column({ type: 'integer', nullable: false, default: 0 })
  atimensec!: number

  @Column({ type: 'integer', nullable: false, default: 0 })
  mtimensec!: number

  @Column({ type: 'integer', nullable: false, default: 0 })
  ctimensec!: number

  @Column({ type: 'integer', nullable: false })
  nlink!: number

  @Column({ type: 'bigint', nullable: false })
  length!: number

  @Column({ type: 'integer', nullable: true })
  rdev?: number

  @Column({ type: 'bigint', nullable: true, transformer: inoTransformer })
  parent?: Inode

  @Column({ type: 'integer', nullable: true, name: 'access_acl_id' })
  accessACLId?: number

  @Column({ type: 'integer', nullable: true, name: 'default_acl_id' })
  defaultACLId?: number
}

@Entity('fd_chunk')
export class Chunk {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false, transformer: inoTransformer })
  @Index('IDX_fd_chunk_inode_indx', { unique: true })
  inode!: Inode

  @Column({ type: 'integer', nullable: false })
  @Index('IDX_fd_chunk_inode_indx', { unique: true })
  indx!: number

  @Column({ type: 'blob', nullable: false })
  slices!: Buffer
}

@Entity('fd_chunk_ref')
export class SliceRef {
  @PrimaryColumn({ type: 'bigint', name: 'chunkid' })
  id!: number

  @Column({ type: 'integer', nullable: false })
  size!: number

  @Column({ type: 'integer', nullable: false })
  @Index('IDX_fd_chunk_ref_refs')
  refs!: number
}

@Entity('fd_delslices')
export class Delslices {
  @PrimaryColumn({ type: 'bigint', name: 'chunkid' })
  id!: number

  @Column({ type: 'bigint', nullable: false })
  deleted!: number

  @Column({ type: 'blob', nullable: false })
  slices!: Buffer
}

@Entity('fd_symlink')
export class Symlink {
  @PrimaryColumn({ type: 'bigint', transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'blob', length: 4096, nullable: false })
  target!: Buffer
}

@Entity('fd_xattr')
export class Xattr {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false, transformer: inoTransformer })
  @Index('IDX_fd_xattr_inode_name', { unique: true })
  inode!: Inode

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index('IDX_fd_xattr_inode_name', { unique: true })
  name!: string

  @Column({ type: 'blob', nullable: false })
  value!: Buffer
}

@Entity('fd_flock')
export class Flock {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false, transformer: inoTransformer })
  @Index('IDX_fd_flock_inode_sid_owner', { unique: true })
  inode!: Inode

  @Column({ type: 'bigint', nullable: false })
  @Index('IDX_fd_flock_inode_sid_owner', { unique: true })
  sid!: number

  @Column({ type: 'bigint', nullable: false })
  @Index('IDX_fd_flock_inode_sid_owner', { unique: true })
  owner!: number

  @Column({ type: 'integer', nullable: false })
  ltype!: number
}

@Entity('fd_plock')
export class Plock {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false, transformer: inoTransformer })
  @Index('IDX_fd_plock_inode_sid_owner', { unique: true })
  inode!: Inode

  @Column({ type: 'bigint', nullable: false })
  @Index('IDX_fd_plock_inode_sid_owner', { unique: true })
  sid!: number

  @Column({ type: 'bigint', nullable: false })
  @Index('IDX_fd_plock_inode_sid_owner', { unique: true })
  owner!: number

  @Column({ type: 'blob', nullable: false })
  records!: Buffer
}

@Entity('fd_session')
export class Session {
  @PrimaryColumn({ type: 'bigint' })
  sid!: number

  @Column({ type: 'bigint', nullable: false })
  heartbeat!: number

  @Column({ type: 'blob', nullable: true })
  info?: Buffer
}

@Entity('fd_session2')
export class Session2 {
  @PrimaryColumn({ type: 'bigint' })
  sid!: number

  @Column({ type: 'bigint', nullable: false })
  expire!: number

  @Column({ type: 'blob', nullable: false })
  info!: Buffer
}

@Entity('fd_sustained')
export class Sustained {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false })
  @Index('IDX_fd_sustained_sid_inode', { unique: true })
  sid!: number

  @Column({ type: 'bigint', nullable: false, transformer: inoTransformer })
  @Index('IDX_fd_sustained_sid_inode', { unique: true })
  inode!: Inode
}

@Entity('fd_delfile')
export class Delfile {
  @PrimaryColumn({ type: 'bigint', transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'bigint', nullable: false })
  length!: number

  @Column({ type: 'bigint', nullable: false })
  expire!: number
}

@Entity('fd_dir_stats')
export class DirStats {
  @PrimaryColumn({ type: 'bigint', transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'bigint', nullable: false })
  dataLength!: number

  @Column({ type: 'bigint', nullable: false })
  usedSpace!: number

  @Column({ type: 'bigint', nullable: false })
  usedInodes!: number
}

@Entity('fd_dir_quota')
export class DirQuota {
  @PrimaryColumn({ type: 'bigint', transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'bigint', nullable: false })
  maxSpace!: number

  @Column({ type: 'bigint', nullable: false })
  maxInodes!: number

  @Column({ type: 'bigint', nullable: false })
  usedSpace!: number

  @Column({ type: 'bigint', nullable: false })
  usedInodes!: number
}

@Entity('fd_detached_node')
export class DetachedNode {
  @PrimaryColumn({ type: 'bigint', transformer: inoTransformer })
  inode!: Inode

  @Column({ type: 'bigint', nullable: false })
  added!: number
}

@Entity('fd_acl')
export class Acl {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'integer', nullable: false })
  owner!: number

  @Column({ type: 'integer', nullable: false })
  group!: number

  @Column({ type: 'integer', nullable: false })
  mask!: number

  @Column({ type: 'integer', nullable: false })
  other!: number

  @Column({ type: 'blob', nullable: false })
  namedUsers!: Buffer

  @Column({ type: 'blob', nullable: false })
  namedGroups!: Buffer
}

@Entity('fd_slice')
export class Slice {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'bigint', nullable: false })
  chunk!: number

  @Column({ type: 'int', nullable: false })
  pos!: number

  @Column({ type: 'bigint', nullable: false })
  size!: number

  @Column({ type: 'blob', nullable: false })
  blks!: Buffer
}

export async function doLoad(): Promise<string> {
  try {
    const dataSource = await newEngine()
    const dbMeta = new DbMeta(dataSource)

    // 尝试获取format设置项
    const formatValue = await dbMeta.getSetting('format')
    return formatValue || 'ok'
  } catch (error) {
    console.error('Failed to load database metadata:', error)
    return 'error'
  }
}

export function doInit(format: string, force: boolean): void {
  console.log(format)
}

export class DbMeta {
  private dataSource: DataSource
  private noReadOnlyTxn: boolean = false

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource
  }

  private shouldRetry(err: Error): boolean {
    if (!err || !err.message) {
      return false
    }

    const msg = err.message.toLowerCase()

    // 检查是否是"太多连接"或"太多客户端"等错误
    if (msg.includes('too many connections') || msg.includes('too many clients')) {
      return true
    }

    // 检查特定数据库的锁定错误
    if (
      msg.includes('database is locked') ||
      msg.includes('deadlock') ||
      msg.includes('lock wait timeout') ||
      msg.includes('serialization failure')
    ) {
      return true
    }

    return false
  }

  async roTxn<T>(f: (entityManager: EntityManager) => Promise<T>): Promise<T> {
    const start = Date.now()
    const maxRetries = 50
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      try {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (!this.noReadOnlyTxn) {
          await queryRunner.startTransaction('REPEATABLE READ')
          queryRunner.query('SET TRANSACTION READ ONLY')
        } else {
          await queryRunner.startTransaction()
        }

        try {
          const result = await f(queryRunner.manager)

          await queryRunner.commitTransaction()
          const duration = Date.now() - start
          if (duration > 100) {
            console.log(`roTxn completed in ${duration}ms`)
          }
          return result
        } catch (err) {
          await queryRunner.rollbackTransaction()
          throw err
        } finally {
          await queryRunner.release()
        }
      } catch (err: unknown) {
        lastError = err as Error
        if (!this.shouldRetry(err as Error)) {
          break
        }
        const backoff = Math.min(100 * Math.pow(2, i), 1000)
        console.warn(
          `Transaction error (attempt ${i + 1}/${maxRetries}), retrying in ${backoff}ms:`,
          err
        )
        await new Promise((resolve) => setTimeout(resolve, backoff))
      }
    }
    console.error(`Already tried ${maxRetries} times, returning error:`, lastError)
    throw lastError
  }

  async getSetting(name: string): Promise<string | null> {
    try {
      return await this.roTxn(async (manager: EntityManager) => {
        const setting = await manager.findOneBy(Setting, {
          key: name
        })

        return setting ? setting.value : null
      })
    } catch (error) {
      console.error(`Failed to get setting ${name}:`, error)
      throw error
    }
  }
}
