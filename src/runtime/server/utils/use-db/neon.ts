// @ts-expect-error virtual file

import { drizzle } from 'drizzle-orm/neon-serverless'

// @ts-expect-error will be installed by nitro
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { useRuntimeConfig } from '#imports'

// @ts-expect-error virtual file
import { schema } from '#server-extension/db/schema.mjs'

neonConfig.webSocketConstructor = ws

export const useDB = () => {
  const { databaseUrl } = useRuntimeConfig()
  const pool = new Pool({ connectionString: 'postgresql://mukundshah:0ap1oxDFyich@ep-wispy-frost-56812669-pooler.ap-southeast-1.aws.neon.tech/dev?sslmode=require' })
  const db = drizzle(pool, { schema, logger: true })

  return { db, pool }
}
