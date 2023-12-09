import { drizzle } from 'drizzle-orm/better-sqlite3'

// @ts-expect-error will be installed by nitro
import Database from 'better-sqlite3'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'



export const useDB = () => {
  const sqlite = new Database('sqlite.db')
  const db = drizzle(sqlite, { schema })

  return { db }
}
