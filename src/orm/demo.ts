import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'

const db = createDatabase(
  sqlite({
    name: ':memory:',
  }),
)

class Model {
  static TABLE_NAME = this.name
  static CONNECTION_NAME = 'default'

  static id = 'integer'

  static async create() {
    const reserved = ['TABLE_NAME', 'CONNECTION_NAME']
    const schemaColumns = Object.entries(this)
      .filter(([name]) => !reserved.includes(name))
      .map(([name, type]) => `${name} ${type.toUpperCase()}`)
      .join(', ')

    return db.exec(`CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (id INTEGER PRIMARY KEY, ${schemaColumns})`)
  }

  static async drop() {
    return db.exec(`DROP TABLE IF EXISTS ${this.TABLE_NAME}`)
  }

  constructor(data: Record<string, any>) {
    new Proxy(this, {
      get(target, prop: string) {
        if (prop in target) {
          return target[prop]
        }
        return target._data[prop]
      },
      set(target, prop: string, value) {
        if (prop in target) {
          target[prop] = value
        } else {
          target._data[prop] = value
        }
        return true
      },
    })
    this._data = data
  }

  async save() {
    const now = new Date().toISOString()
    if ('id' in this._data) {
      // Update existing record
      const columns = Object.keys(this._data).filter(key => key !== 'id')
      const updates = columns.map(col => `${col} = ?`).join(', ')
      const values = [...columns.map(key => this._data[key]), now, this._data.id]
      return db.prepare(`UPDATE ${this.TABLE_NAME} SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values)
    } else {
      // Insert new record
      const columns = Object.keys(this._data).filter(key => key !== 'id')
      const placeholders = columns.map(() => '?').join(', ')
      const values = [...columns.map(key => this._data[key]), now, now]
      return db.prepare(`INSERT INTO ${this.TABLE_NAME} (${columns.join(', ')}, createdAt, updatedAt) VALUES (${placeholders}, ?, ?)`).run(...values)
    }
  }
}

class User extends Model {
  static name = 'string'
}

async function main() {
  User.create()

  const user = new User({ name: 'Alice' })
  await user.save()
}

main()
