import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const base = {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}

export const artists = sqliteTable('artists', {
  ...base,
  name: text('name').notNull(),
})

export const albums = sqliteTable('albums', {
  ...base,
  artistId: integer('artist_id').references(() => artists.id),
  title: text('title').notNull(),
})

export const tracks = sqliteTable('tracks', {
  ...base,
  albumId: integer('album_id').references(() => artists.id),
  name: text('name').notNull(),
})
