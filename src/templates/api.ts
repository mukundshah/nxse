import { type ESMImport, genImport } from 'knitwork'

import { createResolver } from 'nuxt/kit'
import { undent } from '../string'

export const ACTION_METHODS: Record<string, string> = {
  list: 'get',
  create: 'post',
  read: 'get',
  update: 'patch',
  delete: 'delete',
}

export const baseImports: Record<string, ESMImport | ESMImport[]> = {
  'h3': ['defineEventHandler'],
  '#server-extension/db': ['useDB'],
}

export const handler = (imports: Record<string, ESMImport | ESMImport[]>, body: string, returns: string, model: string, schema: string, pool = false) => pool
  ? undent`
${Object.entries(imports).map(([module, names]) => genImport(module, names)).join('\n')}

${genImport(schema, [{ name: model, as: 'model' }])}

export default defineEventHandler(async (event) => {
  const { db, pool } = useDB()
  const { cloudflare } = event.context

  ${body}

  if (cloudflare) cloudflare.context.waitUntil(pool.end())

  return ${returns}
})
`
  : undent`
${Object.entries(imports).map(([module, names]) => genImport(module, names)).join('\n')}

${genImport(schema, [{ name: model, as: 'model' }])}

export default defineEventHandler(async (event) => {
  const { db } = useDB()

  ${body}

  return ${returns}
})
`

export const crud = (primaryKey = 'id') => ({
  list: {
    imports: {
      ...baseImports,
      'zod': ['z'],
      'drizzle-zod': ['createSelectSchema'],
      '#server-extension/utils/h3-sql': ['h3SQL'],
    },
    body: undent`
    const schema = createSelectSchema(model)
    const _h3SQL = h3SQL(event, model)

    const { sql: filterSQL } = _h3SQL.filter()
    const { sql: sortingSQL } = _h3SQL.sort()

    let dbQuery = db.select().from(model).$dynamic()
    let countQuery = db.select({}).from(model).$dynamic()

    if (filterSQL.queryChunks.length > 0) {
      dbQuery = dbQuery.where(filterSQL)
      countQuery = countQuery.where(filterSQL)
    }

    if (sortingSQL.queryChunks.length > 0) {
      dbQuery = dbQuery.orderBy(sortingSQL)
      countQuery = countQuery.orderBy(sortingSQL)
    }

    // const [_count, results] = await Promise.all([
    //  countQuery,
    //  _h3SQL.paginate(dbQuery),
    // ])

    const _count = (await countQuery).length
    const results = await _h3SQL.paginate(dbQuery)
  `,
    returns: undent`
    {
      pagination: {
        page: _h3SQL.pagination.page,
        size: _h3SQL.pagination.size,
        total: _count,
        pages: Math.ceil(_count / _h3SQL.pagination.size),
      },
      results: z.array(schema).parse(results),
      filters: {}
    }
  `,
  },

  create: {
    imports: {
      ...baseImports,
      'h3': [...baseImports.h3, 'readValidatedBody'],
      'drizzle-zod': ['createSelectSchema'],
    },
    body: undent`
    const schema = createSelectSchema(model)
    const body = await readValidatedBody(event, schema.omit({ id: true }).parse)
    const result = await db.insert(model).values(body).returning()
  `,
    returns: undent`
    schema.parse(result[0])
  `,
  },

  read: {
    imports: {
      ...baseImports,
      'h3': [...baseImports.h3, 'getRouterParam'],
      'drizzle-orm': ['eq'],
      'drizzle-zod': ['createSelectSchema'],
    },
    body: undent`
    const pkParam = getRouterParam(event, '${primaryKey}')
    const pk = Number(pkParam) || pkParam

    const schema = createSelectSchema(model)
    const result = await db.select().from(model).where(eq(model.${primaryKey}, pk))
    console.log(result)

    `,
    returns: undent`
    schema.parse(result[0])
  `,
  },

  update: {
    imports: {
      ...baseImports,
      'h3': [...baseImports.h3, 'readValidatedBody', 'getRouterParam'],
      'drizzle-orm': ['eq'],
      'drizzle-zod': ['createSelectSchema'],
    },
    body: undent`
    const pkParam = getRouterParam(event, '${primaryKey}')
    const pk = Number(pkParam) || pkParam

    const schema = createSelectSchema(model)
    const body = await readValidatedBody(event, schema.omit({ ${primaryKey}: true }).partial().parse)
    const result = await db.update(model).set(body).where(eq(model.${primaryKey}, pk)).returning()
  `,
    returns: undent`
    schema.parse(result[0])
  `,
  },

  delete: {
    imports: {
      ...baseImports,
      'h3': [...baseImports.h3, 'getRouterParam'],
      'drizzle-orm': ['eq'],
      'drizzle-zod': ['createSelectSchema'],
    },
    body: undent`
    const pkParam = getRouterParam(event, '${primaryKey}')
    const pk = Number(pkParam) || pkParam

    const schema = createSelectSchema(model)
    const result = await db.delete(model).where(eq(model.${primaryKey}, pk)).returning()
  `,
    returns: undent`
    schema.parse(result[0])
  `,
  },
})
