import { drizzle } from 'drizzle-orm/mysql2'

// @ts-expect-error will be installed by nitro
import mysql from 'mysql2/promise'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

export const useDB = () => {
  const pool = mysql.createPool({
    host: 'host',
    user: 'user',
    database: 'database',
  })
  const db = drizzle(pool, { schema })

  return { db, pool }
}
