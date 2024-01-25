import { drizzle } from 'drizzle-orm/planetscale-serverless'

// @ts-expect-error will be installed by nitro
import { connect } from '@planetscale/database'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

// @ts-expect-error virtual file
import { credential } from '#server-extension/db/credential.mjs'

export const useDB = () => {
  const client = connect(credential)
  const db = drizzle(client, { schema })

  return { db, client }
}
