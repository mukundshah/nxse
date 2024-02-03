import { drizzle } from 'drizzle-orm/mysql2'

// @ts-expect-error will be installed by nitro
import mysql from 'mysql2/promise'

// @ts-expect-error virtual file
import { schema } from '#nxse/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#nxse/db/credential.mjs'

export const useDB = () => {
  const connection = mysql.createConnection(credential)
  const db = drizzle(connection, { schema })

  return { db }
}
