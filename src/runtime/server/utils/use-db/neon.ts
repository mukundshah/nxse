import { drizzle } from 'drizzle-orm/neon-serverless'

// @ts-expect-error will be installed by user
import { Pool } from '@neondatabase/serverless'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#server-extension/db/credential.mjs'

export const useDB = () => {
  const pool = new Pool(credential)
  const db = drizzle(pool, { schema, logger: true })

  return { db, pool }
}
