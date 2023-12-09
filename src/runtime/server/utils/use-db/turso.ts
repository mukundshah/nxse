import { drizzle } from 'drizzle-orm/libsql'

// @ts-expect-error will be installed by nitro
import { createClient } from '@libsql/client'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'



export const useDB = () => {
  const client = createClient({ url: 'DATABASE_URL', authToken: 'DATABASE_AUTH_TOKEN' });
  const db = drizzle(client, { schema });

  return { db, client }
}
