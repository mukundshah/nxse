import { joinURL } from "ufo";
import {
  addComponentsDir,
  addLayout,
  addServerHandler,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendPages,
} from "nuxt/kit";
import { kebabCase } from "scule";
import type { Table } from "drizzle-orm";

import { ACTION_METHODS, crud, handler } from "./templates/api";
import { crud as crudPages } from "./templates/pages";
import { createFormSchema } from "./runtime/server/utils/drizzle-form";

import { name, version } from '../package.json'

export interface ModuleOptions {
  drizzleSchema: string;
  adminSchema: string;
  database: {
    provider: "neon" | "sqlite3" | "turso" | "mysql" | "pg" | "planetscale" | "d1"
    pool: boolean;
    binding: string | null;
    logger: boolean;
  };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: "serverExtension"
  },
  async setup(options, nuxt) {
    if (!options.drizzleSchema || !options.adminSchema) return;

    const { resolve, resolvePath } = createResolver(import.meta.url)
    const schema = await resolvePath(options.drizzleSchema, { cwd: nuxt.options.rootDir });

    addLayout({ src: resolve("./runtime/layouts/admin.vue") }, "admin");
    addComponentsDir({ path: resolve("./runtime/components") });

    nuxt.options.nitro.virtual ||= {};

    const adminSchema: any = await import(await resolvePath(options.adminSchema, { cwd: nuxt.options.rootDir })).then(
      (m) => m.default || m
    );

    nuxt.options.nitro.virtual!["#server-extension/db/schema.mjs"] = `export * as schema from '${schema}'`;
    nuxt.options.nitro.virtual!["#server-extension/db/config.mjs"] = `export const config = ${JSON.stringify(
      options.database
    )}`;

    nuxt.hooks.hook("nitro:config", async (nitroConfig) => {
      nitroConfig.alias!["#server-extension/utils/h3-sql"] = resolve("./runtime/server/utils/h3-sql.ts");
      nitroConfig.alias!["#server-extension/utils/drizzle-form"] = resolve("./runtime/server/utils/drizzle-form.ts");
      nitroConfig.alias!["#server-extension/db"] = resolve(
        `./runtime/server/utils/use-db/${options.database.provider}.ts`
      );
    });

    const fileName = (model: string, action: string, primaryKey: string, base = "/", extension = true) => {
      const method = ACTION_METHODS[action];
      return joinURL(
        base,
        model,
        `${action === "list" || action === "create" ? "index" : `[${primaryKey}]`}.${method}${extension ? ".ts" : ""}`
      );
    };

    const pageFileName = (model: string, action: string, primaryKey: string, base = "/", extension = true) => {
      const names: Record<string, string> = {
        list: "index",
        create: "add",
        edit: `[${primaryKey}]/edit`,
        delete: `[${primaryKey}]/delete`,
      };
      return joinURL(base, model, `${names[action]}${extension ? ".vue" : ""}`);
    };

    const schemas = await import(schema).then((m) => m.default || m);

    // FIXME: @ts-expect-error fix this
    // @ts-expect-error fix this
    adminSchema.forEach(({ table, primaryKey }) => {
      // check id tableName is in schema
      if (!schemas[table]) throw new Error(`Table ${table} not found in schema`);

      const drizzleTable = schemas[table] as Table;
      console.log(createFormSchema(drizzleTable));

      Object.entries(crud(primaryKey)).forEach(([action, { imports, body, returns }]) => {
        addTemplate({
          write: true,
          filename: fileName(table, action, primaryKey, "server-extension/admin/api"),
          getContents: async () => handler(imports, body, returns, table, schema),
        });

        nuxt.options.nitro.virtual![`#${fileName(table, action, primaryKey, "server-extension/admin/api")}`] = () =>
          nuxt.vfs[`#build/${fileName(table, action, primaryKey, "server-extension/admin/api", false)}`];

        addServerHandler({
          route: `/admin/api/${table}${action === "list" ? "" : action === "create" ? "" : `/:${primaryKey}`}`,
          handler: `#${fileName(table, action, primaryKey, "server-extension/admin/api")}`,
          method: ACTION_METHODS[action],
        });
      });

      Object.entries(crudPages(table, createFormSchema(drizzleTable))).forEach(([action, template]) => {
        addTemplate({
          write: true,
          filename: pageFileName(kebabCase(table), action, primaryKey, "server-extension/admin/pages"),
          getContents: async () => template,
        });

        extendPages((pages) => {
          pages.unshift({
            name: kebabCase(`${table}Admin${action[0].toUpperCase()}${action.slice(1)}`),
            path: joinURL(
              "/admin",
              kebabCase(table),
              action === "list" ? "" : action === "create" ? "add" : `:${primaryKey}`
            ),
            file: `#build/${pageFileName(kebabCase(table), action, primaryKey, "server-extension/admin/pages")}`,
            meta: {
              layout: "admin",
            },
          });
        });
      });
    });
  },
});
