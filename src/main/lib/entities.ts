import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('fd_storage')
export class StorageEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string

  @Column({ type: 'varchar', length: 255 })
  type: string

  @Column({ type: 'varchar', length: 4096 })
  values: string
}
