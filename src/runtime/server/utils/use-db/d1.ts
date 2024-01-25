import { env } from 'std-env'
import { drizzle } from 'drizzle-orm/d1'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#server-extension/db/credential.mjs'

export const useDB = () => {
  const db = drizzle(credential.dbName, { schema })

  return { db }
}
