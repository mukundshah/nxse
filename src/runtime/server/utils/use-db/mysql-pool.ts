import { drizzle } from 'drizzle-orm/mysql2'

// @ts-expect-error will be installed by user
import mysql from 'mysql2/promise'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#server-extension/db/credential.mjs'

export const useDB = () => {
  const pool = mysql.createPool(credential)
  const db = drizzle(pool, { schema })

  return { db, pool }
}
