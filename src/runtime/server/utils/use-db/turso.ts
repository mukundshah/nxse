import { drizzle } from 'drizzle-orm/libsql'

// @ts-expect-error will be installed by nitro
import { createClient } from '@libsql/client'

// @ts-expect-error virtual file
import { schema } from '#nxse/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#nxse/db/credential.mjs'

export const useDB = () => {
  const client = createClient(credential)
  const db = drizzle(client, { schema })

  return { db, client }
}
