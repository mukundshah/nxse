---
outline: deep
---

# Nuxt Config

Configure NXSE in the `nxse` section of `nuxt.config.ts`:

## admin

### enabled

- Type: `boolean`
- Default: `false`

Enable the admin panel.

### schema

- Type: `string`
- Default: `server/admin.schema.ts`

Path to the admin schema file.

### route

- Type: `string`
- Default: `/admin`

The route to the admin panel.

### title

- Type: `string`
- Default: `NXSE Admin`

The title of the admin panel.

## drizzle

### schema

- Type: `string`
- Default: `server/drizzle.schema.ts`

Path to the drizzle schema file.

### driver

- Type: `turso | better-sqlite3 | d1 | libsql | pg`
- Default: `better-sqlite3`

The database driver to use.

### dbCredentials

- Type: `DBCredentials`
- Default:

```ts
{
  url: 'db.sqlite3'
}
```

The database credentials to use. Depends on the database driver.

**SQ Lite**

::: code-group

```ts [d1]
type DBCredentials = {
  wranglerConfigPath: string
  dbName: string
}
```

```ts [turso]
type DBCredentials = {
  url: string
  authToken?: string
}
```

```ts [better-sqlite3]
type DBCredentials = {
  url: string
}
```

```ts [libsql]
type DBCredentials = {
  url: string
}
```

:::

**PostgreSQL**

::: code-group

```ts [pg]
type DBCredentials = {
  host: string
  port?: number
  user?: string
  password?: string
  database: string
  ssl?: boolean
} | {
  connectionString: string
}
```

:::

**MySQL**

::: code-group

```ts [mysql2]
type DBCredentials = {
  host: string
  port?: number
  user?: string
  password?: string
  database: string
} | {
  uri: string
}
```
