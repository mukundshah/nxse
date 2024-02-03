import { drizzle } from 'drizzle-orm/better-sqlite3'

// @ts-expect-error will be installed by nitro
import Database from 'better-sqlite3'

// @ts-expect-error virtual file
import { schema } from '#nxse/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#nxse/db/credential.mjs'

export const useDB = () => {
  const sqlite = new Database(credential.url)
  const db = drizzle(sqlite, { schema })

  return { db }
}
