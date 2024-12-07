import { DataSource } from 'typeorm'
import * as fs from 'fs'
import path from 'path'
import initSql from '../../../resources/sql/init.sql?asset'

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: '../fd.db',
  logging: true,
  synchronize: true,
})

export const initDB = (): void => {
  AppDataSource.initialize().then(async (ds) => {
    const sqlFilePath = path.resolve(__dirname, initSql)
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    const sqlStatements = sqlContent.split(';')
    for (const statement of sqlStatements) {
      if (statement.trim() !== '' && !statement.trim().startsWith('--')) {
        await ds.query(statement.trim())
      }
    }
  })
}
