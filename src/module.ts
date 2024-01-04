import { joinURL } from 'ufo'
import {
  addComponentsDir,
  addLayout,
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
} from 'nuxt/kit'
import { kebabCase } from 'scule'
import type { Table } from 'drizzle-orm'
import type { DbConnection, Config as _DrizzleKitConfig } from 'drizzle-kit'

import { name, version } from '../package.json'
import { ACTION_METHODS, crud, handler } from './templates/api'
import { crud as crudPages } from './templates/pages'
import { buildNavigationTree } from './templates/navigation-tree'
import { createFormSchema } from './runtime/server/utils/drizzle-form'

// type DbConnectionWithPlatform = DbConnection extends infer R ? R extends { driver: 'pg' | 'libsql' } ? R & { platform?: string } : R : never

type DrizzleKitConfig = Partial<Omit<_DrizzleKitConfig, 'schema'> & { schema?: string } & DbConnection>
export interface ModuleOptions {
  adminSchema: string
  drizzle: {
    config?: DrizzleKitConfig
    path?: string
  }
}

const defaultDrizzleConfig: DrizzleKitConfig = {}

const defaults = {
  adminSchema: 'src/admin/schema.ts',
  drizzle: {
    config: defaultDrizzleConfig,
    path: 'drizzle.config',
  },
}

export default defineNuxtModule<ModuleOptions>({
  meta: { name, version, configKey: 'serverExtension' },
  defaults,
  async setup(options, nuxt) {
    if (!options.drizzle.config.schema || !options.adminSchema) return

    const { resolve, resolvePath } = createResolver(import.meta.url)
    const schema = await resolvePath(options.drizzle.config.schema, { cwd: nuxt.options.rootDir })

    addLayout({ src: resolve('./runtime/layouts/admin.vue') }, 'admin')
    addComponentsDir({ path: resolve('./runtime/components') })

    nuxt.options.nitro.virtual ||= {}

    const adminSchema: any = await import(await resolvePath(options.adminSchema, { cwd: nuxt.options.rootDir })).then(
      m => m.default || m,
    )

    nuxt.options.nitro.virtual!['#server-extension/db/schema.mjs'] = `export * as schema from '${schema}'`
    nuxt.options.nitro.virtual!['#server-extension/db/credential.mjs'] = `export const credential = ${JSON.stringify(options.drizzle.config.dbCredentials)}`

    nuxt.hooks.hook('nitro:config', async (nitroConfig) => {
      nitroConfig.alias!['#server-extension/utils/h3-sql'] = resolve('./runtime/server/utils/h3-sql.ts')
      nitroConfig.alias!['#server-extension/utils/drizzle-form'] = resolve('./runtime/server/utils/drizzle-form.ts')
      nitroConfig.alias!['#server-extension/db'] = resolve(
        `./runtime/server/utils/use-db/${options.drizzle.config.driver}.ts`,
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

    const schemas = await import(schema).then(m => m.default || m)

    if (adminSchema.length) {
      addTemplate({
        write: true,
        filename: 'server-extension/admin/navigation-tree.mjs',
        getContents: () => buildNavigationTree(adminSchema),
      })

      addTemplate({
        write: true,
        filename: 'server-extension/admin/pages/index.vue',
        getContents: () => `<template> <div></div> </template>`,
      })
      extendPages((pages) => {
        pages.unshift({
          name: 'admin',
          path: '/admin',
          file: '#build/server-extension/admin/pages/index.vue',
          meta: { layout: 'admin' },
        })
      })
    }

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
          route: `/admin/api/${table}${action === 'list' ? '' : action === 'create' ? '' : `/:${primaryKey}`}`,
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
            path: joinURL('/admin', kebabCase(table), action === 'list' ? '' : action === 'create' ? 'add' : `:${primaryKey}`),
            file: `#build/${pageFileName(kebabCase(table), action, primaryKey, 'server-extension/admin/pages')}`,
            meta: { layout: 'admin' },
          })
        })
      })
    })
  },
})
