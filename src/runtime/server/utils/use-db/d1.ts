import { env } from 'std-env'
import { drizzle } from 'drizzle-orm/d1'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

export const useDB = () => {
  const db = drizzle(env.BINDING_NAME, { schema })

  return { db }
}
