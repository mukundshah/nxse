import { sql } from 'drizzle-orm'
import { getQuery } from 'h3'

import type { H3Event } from 'h3'
import type { Table } from 'drizzle-orm'
import type { PgSelect } from 'drizzle-orm/pg-core'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'

// TODO: add support for logical operators
// FIXME: validate fields are valid columns, else handle gracefully

export const h3SQL = <TTable extends Table> (event: H3Event, table: TTable) => {
  const { page, size, sort: sortQuery, q: _q, ...filterQuery } = getQuery(event)

  const pagination = {
    page: Math.max(1, Number(page) || 1),
    size: Math.max(1, Number(size) || 10),
  }

  const paginate = <TQuery extends PgSelect | SQLiteSelect> (qb: TQuery) => {
    return qb.limit(pagination.size).offset((pagination.page - 1) * pagination.size)
  }

  const sort = () => {
    if (!sortQuery) return { sql: sql.empty() }

    const sqlQuery = String(sortQuery).split(',').reduce((chunks, part, index) => {
      const cleanedPart = part.replace(/^[-]/, '')
      const column = table[cleanedPart as keyof TTable]
      if (!column) return chunks
      if (index > 0) chunks.append(sql`, `)
      return chunks.append(sql`${column} ${sql.raw(part.startsWith('-') ? 'desc' : 'asc')}`)
    }, sql.empty())

    return { sql: sqlQuery }
  }

  const parseFilterValue = (value: string) => {
    if (value === '') return ['is', 'null']
    if (value === '!') return ['is not', 'null']

    const startsWith = (prefix: string) => value.startsWith(prefix)
    const removePrefix = (prefix: string) => value.substring(prefix.length)

    if (startsWith('>=')) return ['>=', removePrefix('>=')]
    if (startsWith('<=')) return ['<=', removePrefix('<=')]
    if (startsWith('>')) return ['>', removePrefix('>')]
    if (startsWith('<')) return ['<', removePrefix('<')]

    // range
    if (value.includes('..')) {
      const [start, end] = startsWith('!') ? removePrefix('!').split('..') : value.split('..')
      return startsWith('!') ? ['between', [start, end]] : ['not between', [start, end]]
    }

    // array
    if (value.includes(',')) {
      if (startsWith('@>')) return ['contained', removePrefix('@>').split(',')]
      if (startsWith('@')) return ['%', removePrefix('@')]
      if (startsWith('!')) return ['not in', removePrefix('!').split(',')]
      return ['in', value.split(',')]
    }

    if (startsWith('~')) return ['like', removePrefix('~')]
    if (startsWith('!~')) return ['not like', removePrefix('!~')]
    if (startsWith('~*')) return ['ilike', removePrefix('~*')]
    if (startsWith('!~*')) return ['not ilike', removePrefix('!~*')]
    if (startsWith('!')) return ['!=', removePrefix('!')]

    return ['=', value]
  }

  const filter = () => {
    const fq = filterQuery ?? {}

    const sqlQuery = sql.empty()

    Object.entries(fq).forEach(([field, values]) => {
      const column = table[field as keyof TTable]
      if (!column) return

      if (['and', 'or', 'not'].includes(field)) return

      // values could be string or array of strings
      values = Array.isArray(values) ? values : [values]

      const sqlString = values.map((v: string) => {
        const [operator, operand] = parseFilterValue(v)

        if (operator === 'between' || operator === 'not between')
          return `${field} ${operator} ${operand[0]} and ${operand[1]}`

        if (operator === 'in' || operator === 'not in')
          return `${field} ${operator} (${(operand as string[]).map(v => `'${v}'`).join(',')})`

        if (operator === 'like' || operator === 'not like' || operator === 'ilike' || operator === 'not ilike')
          return `${field} ${operator} '${operand}'`

        if (operator === '%')
          return `${field} like '%${operand}%'`

        return `${field} ${operator} ${operand}`
      }).join(' and ')

      sqlQuery.append(sql.raw(sqlString))
    })

    return {
      sql: sqlQuery,
    }
  }

  return {
    pagination,
    paginate,
    sort,
    filter,
  }
}
