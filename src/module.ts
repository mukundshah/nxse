import { join } from 'pathe'
import { joinURL } from 'ufo'
import {
  addComponentsDir,
  addLayout,
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
  useNuxt,
} from 'nuxt/kit'
import { kebabCase } from 'scule'
import type { Table } from 'drizzle-orm'
import type { DbConnection, Config as _DrizzleKitConfig } from 'drizzle-kit'

import { compatibility, configKey, name, version } from '../package.json'
import { ACTION_METHODS, crud, handler } from './templates/api'
import { crud as crudPages } from './templates/pages'
import { buildNavigationTree } from './templates/navigation-tree'
import { createFormSchema } from './runtime/server/utils/drizzle-form'

// type DbConnectionWithPlatform = DbConnection extends infer R ? R extends { driver: 'pg' | 'libsql' } ? R & { platform?: string } : R : never

type DrizzleConfig = Omit<_DrizzleKitConfig, 'schema'> & { schema: string } & DbConnection

/**
 * NXSE Module Options.
 */
export interface ModuleOptions {
  /**
   * Represents the configuration for the admin section.
   */
  admin: {
    /**
     * Specifies whether the admin section is enabled.
     * @default true
     */
    enabled: boolean
    /**
     * Path to `admin.schema.ts` file.
     * @default "server/admin.schema.ts"
     */
    schema: string
    /**
     * Specifies the route at which the admin section is available.
     * @default "/admin"
     */
    route: string
    /**
     * Specifies the title for the admin section.
     * @default "NXSE Admin"
     */
    title: string
  }
  /**
   * Represents the configuration for the drizzle.
   */
  drizzle: DrizzleConfig
}

const defaults = (nuxt = useNuxt()): ModuleOptions => ({
  admin: {
    enabled: true,
    schema: join(nuxt.options.serverDir, 'admin.schema.ts'),
    route: '/admin',
    title: 'NXSE Admin',
  },
  drizzle: {
    schema: join(nuxt.options.serverDir, 'drizzle.schema.ts'),
    driver: 'better-sqlite',
    dbCredentials: {
      url: join(nuxt.options.rootDir, 'db.sqlite'),
    },
  },
})

const meta = { name, version, configKey, compatibility }

export default defineNuxtModule<ModuleOptions>({
  meta,
  defaults,
  async setup(options, nuxt) {
    const { resolve, resolvePath } = createResolver(import.meta.url)

    // Drizzle & Nitro
    const schema = await resolvePath(options.drizzle.schema, { cwd: nuxt.options.rootDir })

    nuxt.options.nitro.virtual ||= {}

    nuxt.options.nitro.virtual!['#server-extension/db/schema.mjs'] = `export * as schema from '${schema}'`
    nuxt.options.nitro.virtual!['#server-extension/db/credential.mjs'] = `export const credential = ${JSON.stringify(options.drizzle.dbCredentials)}`

    nuxt.hooks.hook('nitro:config', async (nitroConfig) => {
      nitroConfig.alias!['#server-extension/utils/h3-sql'] = resolve('./runtime/server/utils/h3-sql.ts')
      nitroConfig.alias!['#server-extension/utils/drizzle-form'] = resolve('./runtime/server/utils/drizzle-form.ts')
      nitroConfig.alias!['#server-extension/db'] = resolve(
        `./runtime/server/utils/use-db/${options.drizzle.driver}.ts`,
      )
    })

    const fileName = (model: string, action: string, primaryKey: string, base = '/', extension = true) => {
      const method = ACTION_METHODS[action]
      return joinURL(
        base,
        model,
        `${action === 'list' || action === 'create' ? 'index' : `[${primaryKey}]`}.${method}${extension ? '.ts' : ''}`,
      )
    }

    const pageFileName = (model: string, action: string, primaryKey: string, base = '/', extension = true) => {
      const names: Record<string, string> = {
        list: 'index',
        create: 'add',
        edit: `[${primaryKey}]/edit`,
        delete: `[${primaryKey}]/delete`,
      }
      return joinURL(base, model, `${names[action]}${extension ? '.vue' : ''}`)
    }

    if (options.admin.enabled) {
      addLayout({ src: resolve('./runtime/layouts/admin.vue') }, 'nxse-admin')
      addComponentsDir({ path: resolve('./runtime/components') })

      const schemas = await import(schema).then(m => m.default || m)
      const adminSchema: any = await import(await resolvePath(options.admin.schema, { cwd: nuxt.options.rootDir })).then(
        m => m.default || m,
      )

      if (adminSchema.length) {
        addTemplate({
          write: true,
          filename: 'server-extension/admin/navigation-tree.mjs',
          getContents: () => buildNavigationTree(options.admin.route, adminSchema),
        })

        addTemplate({
          write: true,
          filename: 'server-extension/admin/pages/index.vue',
          getContents: () => `<template> <div></div> </template>`,
        })
        extendPages((pages) => {
          pages.unshift({
            name: 'admin',
            path: joinURL('/', options.admin.route),
            file: '#build/server-extension/admin/pages/index.vue',
            meta: { layout: 'nxse-admin' },
          })
        })
      }

      // TODO: Add support for multiple primary keys
      // TODO: Add support for multiple schemas
      // TODO: Add types for schemas
      // @ts-expect-error TODO: Add types for schemas
      adminSchema.forEach(({ table, primaryKey }) => {
      // check id tableName is in schema
        if (!schemas[table]) throw new Error(`Table ${table} not found in schema`)

        const drizzleTable = schemas[table] as Table

        Object.entries(crud(primaryKey)).forEach(([action, { imports, body, returns }]) => {
          addTemplate({
            write: true,
            filename: fileName(table, action, primaryKey, 'server-extension/admin/api'),
            getContents: async () => handler(imports, body, returns, table, schema),
          })

          nuxt.options.nitro.virtual![`#${fileName(table, action, primaryKey, 'server-extension/admin/api')}`] = () => nuxt.vfs[`#build/${fileName(table, action, primaryKey, 'server-extension/admin/api', false)}`]

          addServerHandler({
            route: `/__nxse_admin/api/${table}${action === 'list' ? '' : action === 'create' ? '' : `/:${primaryKey}`}`,
            handler: `#${fileName(table, action, primaryKey, 'server-extension/admin/api')}`,
            method: ACTION_METHODS[action],
          })
        })

        Object.entries(crudPages(table, createFormSchema(drizzleTable))).forEach(([action, template]) => {
          addTemplate({
            write: true,
            filename: pageFileName(kebabCase(table), action, primaryKey, 'server-extension/admin/pages'),
            getContents: async () => template,
          })

          extendPages((pages) => {
            pages.unshift({
              name: kebabCase(`${table}Admin${action[0].toUpperCase()}${action.slice(1)}`),
              path: joinURL('/', options.admin.route, kebabCase(table), action === 'list' ? '' : action === 'create' ? 'add' : `:${primaryKey}`),
              file: `#build/${pageFileName(kebabCase(table), action, primaryKey, 'server-extension/admin/pages')}`,
              meta: { layout: 'nxse-admin' },
            })
          })
        })
      })
    }
  },
})
