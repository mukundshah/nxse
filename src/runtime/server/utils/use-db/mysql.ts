import { drizzle } from 'drizzle-orm/mysql2'

// @ts-expect-error will be installed by nitro
import mysql from 'mysql2/promise'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#server-extension/db/credential.mjs'

export const useDB = () => {
  const connection = mysql.createConnection({
    host: 'host',
    user: 'user',
    database: 'database',
  })
  const db = drizzle(connection, { schema })

  return { db }
}
