import { drizzle } from 'drizzle-orm/planetscale-serverless'

// @ts-expect-error will be installed by nitro
import { connect } from '@planetscale/database'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'



export const useDB = () => {
  const client = connect({
    host: process.env["DATABASE_HOST"],
    username: process.env["DATABASE_USERNAME"],
    password: process.env["DATABASE_PASSWORD"],
  });
  const db = drizzle(client, { schema })

  return { db, client }
}
