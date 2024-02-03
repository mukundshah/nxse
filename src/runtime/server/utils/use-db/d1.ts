import { drizzle } from 'drizzle-orm/d1'

// @ts-expect-error virtual file
import { schema } from '#nxse/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#nxse/db/credential.mjs'

export const useDB = () => {
  const db = drizzle(credential.dbName, { schema })

  return { db }
}
