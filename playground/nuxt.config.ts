export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/devtools', '../src/module', '@nuxt/ui'],
  serverExtension: {
    adminSchema: './server/admin.ts',
    drizzle: {
      config: {
        schema: './server/db/schema.ts',
        driver: 'better-sqlite',
        dbCredentials: {
          url: './db.sqlite',
        },
      },
    },
  },
})
