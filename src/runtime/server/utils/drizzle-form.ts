import { splitByCase, upperFirst } from 'scule'
import { getTableColumns, is } from 'drizzle-orm'
import { SQLiteText, getTableConfig as getSQLiteTableConfig } from 'drizzle-orm/sqlite-core'
import { PgChar, PgTable, PgUUID, PgVarchar, getTableConfig as getPgTableConfig } from 'drizzle-orm/pg-core'
import { MySqlChar, MySqlTable, MySqlVarBinary, MySqlVarChar, getTableConfig as getMySqlTableConfig } from 'drizzle-orm/mysql-core'

import type { Column, Table } from 'drizzle-orm'

export const createFormSchema = <TTable extends Table>(table: TTable): any => {
  const columns = getTableColumns(table)
  const columnEntries = Object.entries(columns)

  const getConfig = (t: Table) => is(t, MySqlTable) ? getMySqlTableConfig(t) : is(t, PgTable) ? getPgTableConfig(t) : getSQLiteTableConfig(t)
  const { foreignKeys } = getConfig(table)

  const schemaEntries = columnEntries.reduce((acc, [name, column]) => {
    if (column.primary) return acc // Skip primary keys

    const fk = foreignKeys.find(fk => fk.reference().columns.some(fkColumn => fkColumn.name === column.name))
    if (fk) {
      const fkTable = fk.reference().foreignTable
      const fkColumn = fk.reference().foreignColumns.length === 1 ? fk.reference().foreignColumns[0] : undefined

      if (!fkColumn) throw new Error('Foreign key column is undefined')

      acc[name] = mapForeignKeyColumnToSchema(fkTable, fkColumn, column)
    }
    else if (column) {
      acc[name] = mapColumnToSchema(column)
    }
    // Null values are not added to acc, effectively removing them

    return acc
  }, {} as Record<string, Partial<HTMLInputElement> & { label: string, options?: { value: string, label: string }[] }>)

  return schemaEntries
}

function isWithEnum(column: Column): column is typeof column & { enumValues: [string, ...string[]] } {
  return 'enumValues' in column && Array.isArray(column.enumValues) && column.enumValues.length > 0
}

function mapForeignKeyColumnToSchema(fkTable: Table, fkColumn: Column, column: Column): Partial<HTMLInputElement> & { label: string, table: string } {
  const { name: tableName } = getPgTableConfig(fkTable)
  const columnName = upperFirst(splitByCase(column.name).filter(name => name !== fkColumn.name).join(' ').toLowerCase())

  return {
    type: 'select',
    label: columnName,
    name: column.name,
    value: '',
    required: column.notNull,
    table: tableName,
  }
}

function mapColumnToSchema(column: Column): Partial<HTMLInputElement> & { label: string, options?: { value: string, label: string }[] } {
  const input: Partial<HTMLInputElement> & { label: string, options?: { value: string, label: string }[] } = {
    type: 'text',
    label: upperFirst(splitByCase(column.name).join(' ').toLowerCase()),
    name: column.name,
    value: '',
    required: column.notNull,
  }

  if (isWithEnum(column)) {
    input.type = 'select'
    input.options = column.enumValues.map(value => ({ value, label: value }))
  }

  if (is(column, PgUUID)) {
    input.maxLength = 36
    input.pattern = '^[a-f0-9]{8}-?[a-f0-9]{4}-?[1-5][a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$'
  }
  else if (column.dataType === 'json') {
    input.type = 'textarea'
  }
  else if (column.dataType === 'number') {
    input.type = 'number'
  }
  else if (column.dataType === 'bigint') {
    input.type = 'number'
    input.step = '1'
  }
  else if (column.dataType === 'boolean') {
    input.type = 'checkbox'
  }
  else if (column.dataType === 'date') {
    input.type = 'date'
  }
  else if (column.dataType === 'string') {
    if (
      (is(column, PgChar) || is(column, PgVarchar) || is(column, MySqlVarChar)
      || is(column, MySqlVarBinary) || is(column, MySqlChar) || is(column, SQLiteText))
      && (typeof column.length === 'number')
    )
      input.maxLength = column.length
  }

  return input
}
