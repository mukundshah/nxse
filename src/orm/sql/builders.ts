import type { Database as Connection } from 'db0'
import type { ColumnDefinition, IndexDefinition, JoinCondition, OrderByCondition, WhereCondition } from './types'

export abstract class QueryBuilder {
  abstract build(): string
  abstract execute(): Promise<any>

  constructor(protected connection: Connection) {}
}

export class RawQueryBuilder extends QueryBuilder implements RawBuilder {
  private _params: any[] = []

  params(params: any[]) {
    this._params = params
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class SelectQueryBuilder extends QueryBuilder implements SelectBuilder {
  private selectedColumns: string[] = ['*']
  private tableName: string = ''
  private whereConditions: WhereCondition[] = []
  private joinClauses: string[] = []
  private groupByColumns: string[] = []
  private havingConditions: WhereCondition[] = []
  private orderByColumns: OrderByCondition[] = []
  private limitValue?: number
  private offsetValue?: number
  private isDistinct: boolean = false

  columns(cols: string[]): this {
    this.selectedColumns = cols
    return this
  }

  distinct(): this {
    this.isDistinct = true
    return this
  }

  from(table: string): this {
    this.tableName = table
    return this
  }

  where(condition: WhereCondition): this {
    this.whereConditions.push(condition)
    return this
  }

  join(table: string, condition: JoinCondition): this {
    this.joinClauses.push(this.buildJoinClause('INNER JOIN', table, condition))
    return this
  }

  leftJoin(table: string, condition: JoinCondition): this {
    this.joinClauses.push(this.buildJoinClause('LEFT JOIN', table, condition))
    return this
  }

  rightJoin(table: string, condition: JoinCondition): this {
    this.joinClauses.push(this.buildJoinClause('RIGHT JOIN', table, condition))
    return this
  }

  groupBy(cols: string[]): this {
    this.groupByColumns = cols
    return this
  }

  having(condition: WhereCondition): this {
    this.havingConditions.push(condition)
    return this
  }

  orderBy(cols: OrderByCondition[]): this {
    this.orderByColumns = cols
    return this
  }

  limit(limit: number): this {
    this.limitValue = limit
    return this
  }

  offset(offset: number): this {
    this.offsetValue = offset
    return this
  }

  private buildJoinClause(type: string, table: string, condition: JoinCondition): string {
    if (typeof condition === 'string') {
      return `${type} ${table} ON ${condition}`
    }

    const conditions = Object.entries(condition)
      .map(([key, value]) => `${key} = ${value}`)
      .join(' AND ')

    return `${type} ${table} ON ${conditions}`
  }

  private buildWhereClause(conditions: WhereCondition[]): { sql: string, params: any[] } {
    if (conditions.length === 0) return { sql: '', params: [] }

    const params: any[] = []
    const clauses = conditions.map((condition) => {
      if (typeof condition === 'string') {
        return condition
      }

      return Object.entries(condition).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle operators like IN, >, <, etc.
          const [operator, operand] = Object.entries(value)[0]
          params.push(operand)
          return `${key} ${operator} $${params.length}`
        } else {
          params.push(value)
          return `${key} = $${params.length}`
        }
      }).join(' AND ')
    })

    return {
      sql: `WHERE ${clauses.join(' AND ')}`,
      params,
    }
  }

  build(): { sql: string, params: any[] } {
    const parts: string[] = ['SELECT']
    const params: any[] = []

    // DISTINCT
    if (this.isDistinct) {
      parts.push('DISTINCT')
    }

    // Columns
    parts.push(this.selectedColumns.join(', '))

    // FROM
    parts.push(`FROM ${this.tableName}`)

    // JOINs
    if (this.joinClauses.length > 0) {
      parts.push(this.joinClauses.join(' '))
    }

    // WHERE
    const whereClause = this.buildWhereClause(this.whereConditions)
    if (whereClause.sql) {
      parts.push(whereClause.sql)
      params.push(...whereClause.params)
    }

    // GROUP BY
    if (this.groupByColumns.length > 0) {
      parts.push(`GROUP BY ${this.groupByColumns.join(', ')}`)
    }

    // HAVING
    const havingClause = this.buildWhereClause(this.havingConditions)
    if (havingClause.sql) {
      parts.push(havingClause.sql.replace('WHERE', 'HAVING'))
      params.push(...havingClause.params)
    }

    // ORDER BY
    if (this.orderByColumns.length > 0) {
      const orderBy = this.orderByColumns
        .map(({ column, direction }) => `${column} ${direction}`)
        .join(', ')
      parts.push(`ORDER BY ${orderBy}`)
    }

    // LIMIT
    if (typeof this.limitValue === 'number') {
      parts.push(`LIMIT ${this.limitValue}`)
    }

    // OFFSET
    if (typeof this.offsetValue === 'number') {
      parts.push(`OFFSET ${this.offsetValue}`)
    }

    return {
      sql: parts.join(' '),
      params,
    }
  }

  async execute(): Promise<any[]> {
    const { sql, params } = this.build()

    // Handle different dialects
    const query = this.formatQueryForDialect(sql)

    try {
      return await this.connection.exec(query, params)
    } catch (error) {
      throw new Error(`Failed to execute SELECT query: ${error.message}`)
    }
  }

  private formatQueryForDialect(sql: string): string {
    switch (this.connection.dialect) {
      case 'postgres':
        return sql // Already in Postgres format with $1, $2, etc.
      case 'mysql':
        return sql.replace(/\$(\d+)/g, '?')
      case 'sqlite':
        return sql.replace(/\$(\d+)/g, '?')
      case 'mssql':
        return sql.replace(/\$(\d+)/g, '@p$1')
      default:
        return sql
    }
  }
}

export class InsertQueryBuilder extends QueryBuilder implements InsertBuilder {
  private tableName: string = ''
  private insertData: Record<string, any>[] = []
  private returningColumns: string[] = []
  private isIgnore: boolean = false
  private onConflict: {
    columns?: string[]
    action?: 'UPDATE' | 'NOTHING'
    updateValues?: Record<string, any>
  } = {}

  into(table: string): this {
    this.tableName = table
    return this
  }

  values(data: Record<string, any> | Record<string, any>[]): this {
    this.insertData = Array.isArray(data) ? data : [data]
    return this
  }

  returning(cols: string[]): this {
    this.returningColumns = cols
    return this
  }

  ignore(): this {
    this.isIgnore = true
    return this
  }

  onConflictDoNothing(columns?: string[]): this {
    this.onConflict = {
      columns,
      action: 'NOTHING',
    }
    return this
  }

  onConflictDoUpdate(columns: string[], updateValues: Record<string, any>): this {
    this.onConflict = {
      columns,
      action: 'UPDATE',
      updateValues,
    }
    return this
  }

  build(): { sql: string, params: any[] } {
    if (!this.tableName || this.insertData.length === 0) {
      throw new Error('Table name and values are required for INSERT query')
    }

    const parts: string[] = ['INSERT']
    const params: any[] = []

    // Handle INSERT IGNORE for MySQL
    if (this.isIgnore && this.connection.dialect === 'mysql') {
      parts.push('IGNORE')
    }

    parts.push('INTO', this.tableName)

    // Get all unique column names from all objects
    const columns = [...new Set(
      this.insertData.flatMap(obj => Object.keys(obj)),
    )]

    parts.push(`(${columns.join(', ')})`)

    // Build VALUES clause
    const valueSets: string[] = []
    this.insertData.forEach((data) => {
      const rowValues: string[] = []
      columns.forEach((column) => {
        if (column in data) {
          params.push(data[column])
          rowValues.push(`$${params.length}`)
        } else {
          rowValues.push('DEFAULT')
        }
      })
      valueSets.push(`(${rowValues.join(', ')})`)
    })

    parts.push('VALUES', valueSets.join(', '))

    // Handle ON CONFLICT based on dialect
    if (this.onConflict.action) {
      parts.push(this.buildConflictClause(params))
    }

    // Handle RETURNING based on dialect
    if (this.returningColumns.length > 0) {
      parts.push(this.buildReturningClause())
    }

    return {
      sql: parts.join(' '),
      params,
    }
  }

  private buildConflictClause(params: any[]): string {
    const { columns, action, updateValues } = this.onConflict

    switch (this.connection.dialect) {
      case 'postgresql': {
        let clause = 'ON CONFLICT'
        if (columns?.length) {
          clause += ` (${columns.join(', ')})`
        }

        if (action === 'NOTHING') {
          return `${clause} DO NOTHING`
        } else if (action === 'UPDATE' && updateValues) {
          const updates = Object.entries(updateValues)
            .map(([key, value]) => {
              params.push(value)
              return `${key} = $${params.length}`
            })
            .join(', ')
          return `${clause} DO UPDATE SET ${updates}`
        }
        break
      }

      case 'mysql': {
        if (action === 'NOTHING') {
          return 'ON DUPLICATE KEY UPDATE id=id'
        } else if (action === 'UPDATE' && updateValues) {
          const updates = Object.entries(updateValues)
            .map(([key, value]) => {
              params.push(value)
              return `${key} = ?`
            })
            .join(', ')
          return `ON DUPLICATE KEY UPDATE ${updates}`
        }
        break
      }

      case 'sqlite': {
        if (action === 'NOTHING') {
          return 'ON CONFLICT DO NOTHING'
        } else if (action === 'UPDATE' && updateValues) {
          const updates = Object.entries(updateValues)
            .map(([key, value]) => {
              params.push(value)
              return `${key} = ?`
            })
            .join(', ')
          return `ON CONFLICT DO UPDATE SET ${updates}`
        }
        break
      }
    }

    return ''
  }

  private buildReturningClause(): string {
    switch (this.connection.dialect) {
      case 'postgresql':
      case 'sqlite':
        return `RETURNING ${this.returningColumns.join(', ')}`

      case 'mysql':
        // MySQL doesn't support RETURNING, we'll need to do a separate SELECT
        console.warn('RETURNING clause is not supported in MySQL')
        return ''

      case 'mssql':
        return `OUTPUT INSERTED.${this.returningColumns.join(', INSERTED.')}`

      default:
        return ''
    }
  }

  private formatQueryForDialect(sql: string): string {
    switch (this.connection.dialect) {
      case 'mysql':
      case 'sqlite':
        return sql.replace(/\$(\d+)/g, '?')
      case 'mssql':
        return sql.replace(/\$(\d+)/g, '@p$1')
      default:
        return sql
    }
  }

  async execute(): Promise<any> {
    const { sql, params } = this.build()
    const query = this.formatQueryForDialect(sql)

    try {
      const result = await this.connection.exec(query, params)

      // Handle RETURNING for MySQL since it doesn't support it natively
      if (this.connection.dialect === 'mysql' && this.returningColumns.length > 0) {
        const lastId = result.insertId
        const selectQuery = `
          SELECT ${this.returningColumns.join(', ')}
          FROM ${this.tableName}
          WHERE id = ?
        `
        return await this.connection.exec(selectQuery, [lastId])
      }

      return result
    } catch (error) {
      throw new Error(`Failed to execute INSERT query: ${error.message}`)
    }
  }
}

export class UpdateQueryBuilder extends QueryBuilder implements UpdateBuilder {
  table(tableName: string) {
    return this
  }

  set(data: Record<string, any>) {
    return this
  }

  where(condition: WhereCondition) {
    return this
  }

  returning(cols: string[]) {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class DeleteQueryBuilder extends QueryBuilder implements DeleteBuilder {
  from(table: string) {
    return this
  }

  where(condition: WhereCondition) {
    return this
  }

  returning(cols: string[]) {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class CreateTableQueryBuilder extends QueryBuilder implements CreateTableBuilder {
  ifNotExists() {
    return this
  }

  column(definition: ColumnDefinition) {
    return this
  }

  columns(definitions: ColumnDefinition[]) {
    return this
  }

  primaryKey(columns: string[]) {
    return this
  }

  foreignKey(column: string, reference: ColumnDefinition['references']) {
    return this
  }

  index(indexDefinition: IndexDefinition) {
    return this
  }

  temporary() {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class AlterTableQueryBuilder extends QueryBuilder implements AlterTableBuilder {
  addColumn(definition: ColumnDefinition) {
    return this
  }

  dropColumn(name: string) {
    return this
  }

  alterColumn(name: string, definition: Partial<ColumnDefinition>) {
    return this
  }

  renameColumn(oldName: string, newName: string) {
    return this
  }

  addPrimaryKey(columns: string[]) {
    return this
  }

  dropPrimaryKey() {
    return this
  }

  addForeignKey(column: string, reference: ColumnDefinition['references']) {
    return this
  }

  dropForeignKey(constraintName: string) {
    return this
  }

  addIndex(indexDefinition: IndexDefinition) {
    return this
  }

  dropIndex(indexName: string) {
    return this
  }

  rename(newName: string) {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class DropTableQueryBuilder extends QueryBuilder implements DropTableBuilder {
  ifExists() {
    return this
  }

  cascade() {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class CreateIndexQueryBuilder extends QueryBuilder implements CreateIndexBuilder {
  ifNotExists() {
    return this
  }

  unique() {
    return this
  }

  using(indexType: IndexDefinition['type']) {
    return this
  }

  on(columns: string[]) {
    return this
  }

  where(condition: WhereCondition) {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class DropIndexQueryBuilder extends QueryBuilder implements DropIndexBuilder {
  ifExists() {
    return this
  }

  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class CreateViewQueryBuilder extends QueryBuilder {
  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

export class DropViewQueryBuilder extends QueryBuilder {
  build() {
    return ''
  }

  execute() {
    return Promise.resolve()
  }
}

interface RawBuilder {
  params: (params: any[]) => this
  build: () => string
  execute: () => Promise<any>
}

interface SelectBuilder {
  columns: (cols: string[]) => this
  from: (table: string) => this
  where: (condition: WhereCondition) => this
  join: (table: string, condition: JoinCondition) => this
  leftJoin: (table: string, condition: JoinCondition) => this
  rightJoin: (table: string, condition: JoinCondition) => this
  groupBy: (cols: string[]) => this
  having: (condition: WhereCondition) => this
  orderBy: (cols: OrderByCondition[]) => this
  limit: (limit: number) => this
  offset: (offset: number) => this
  build: () => string
  execute: () => Promise<any[]>
}

interface InsertBuilder {
  into: (table: string) => this
  values: (data: Record<string, any> | Record<string, any>[]) => this
  returning: (cols: string[]) => this
  build: () => string
  execute: () => Promise<any>
}

interface UpdateBuilder {
  table: (tableName: string) => this
  set: (data: Record<string, any>) => this
  where: (condition: WhereCondition) => this
  returning: (cols: string[]) => this
  build: () => string
  execute: () => Promise<any>
}

interface DeleteBuilder {
  from: (table: string) => this
  where: (condition: WhereCondition) => this
  returning: (cols: string[]) => this
  build: () => string
  execute: () => Promise<any>
}

interface CreateTableBuilder {
  ifNotExists: () => this
  column: (definition: ColumnDefinition) => this
  columns: (definitions: ColumnDefinition[]) => this
  primaryKey: (columns: string[]) => this
  foreignKey: (column: string, reference: ColumnDefinition['references']) => this
  index: (indexDefinition: IndexDefinition) => this
  temporary: () => this
  build: () => string
  execute: () => Promise<void>
}

interface AlterTableBuilder {
  addColumn: (definition: ColumnDefinition) => this
  dropColumn: (name: string) => this
  alterColumn: (name: string, definition: Partial<ColumnDefinition>) => this
  renameColumn: (oldName: string, newName: string) => this
  addPrimaryKey: (columns: string[]) => this
  dropPrimaryKey: () => this
  addForeignKey: (column: string, reference: ColumnDefinition['references']) => this
  dropForeignKey: (constraintName: string) => this
  addIndex: (indexDefinition: IndexDefinition) => this
  dropIndex: (indexName: string) => this
  rename: (newName: string) => this
  build: () => string
  execute: () => Promise<void>
}

interface DropTableBuilder {
  ifExists: () => this
  cascade: () => this
  build: () => string
  execute: () => Promise<void>
}

interface CreateIndexBuilder {
  ifNotExists: () => this
  unique: () => this
  using: (indexType: IndexDefinition['type']) => this
  on: (columns: string[]) => this
  where: (condition: WhereCondition) => this
  build: () => string
  execute: () => Promise<void>
}

interface DropIndexBuilder {
  ifExists: () => this
  build: () => string
  execute: () => Promise<void>
}
