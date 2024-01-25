import { undent } from '../string'

export const generateDrizzleConfig = (options: any) => undent`
import { defineConfig } from 'drizzle-kit/utils'

export default defineConfig({
  schema: ${options.schema},
  out: ${options.out},
  driver: ${options.driver},
})
`
