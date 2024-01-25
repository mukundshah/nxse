import { drizzle } from 'drizzle-orm/postgres-js'

// @ts-expect-error will be installed by user
import postgres from 'postgres'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#server-extension/db/credential.mjs'

export const useDB = () => {
  const client = postgres(credential.connectionString)
  const db = drizzle(client, { schema })

  return { db, client }
}
