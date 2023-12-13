import { drizzle } from 'drizzle-orm/postgres-js'

// @ts-expect-error will be installed by nitro
import postgres from 'postgres'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

export const useDB = () => {
  const client = postgres('DATABASE_URL')
  const db = drizzle(client, { schema })

  return { db, client }
}
