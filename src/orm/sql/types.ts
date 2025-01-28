export type WhereCondition = {
  [key: string]: any | { [operator: string]: any }
} | string

export type JoinCondition = {
  [key: string]: string
} | string

export interface OrderByCondition {
  column: string
  direction: 'ASC' | 'DESC'
}

export interface ColumnDefinition {
  name: string
  type: string
  length?: number
  precision?: number
  scale?: number
  nullable?: boolean
  defaultValue?: any
  primaryKey?: boolean
  unique?: boolean
  references?: {
    table: string
    column: string
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  }
  check?: string
}

export interface IndexDefinition {
  columns: string[]
  name?: string
  unique?: boolean
  type?: 'BTREE' | 'HASH' | 'GIST' | 'GIN' // Postgres specific
  where?: WhereCondition // Partial index support
}
