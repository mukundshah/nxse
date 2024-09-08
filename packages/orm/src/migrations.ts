const getMigrationNameTimestamp = () => {
  return new Date().toISOString().replace(/[^0-9]/g, '')
}

export abstract class Migration {
  /**
   * The name of the migration.
   */
  declare name: string

  /**
   * Whether or not this migration is the initial migration.
   */
  initial = false

  /**
   * Whether or not this migration is atomic.
   */
  atomic = true

  /**
   * The migrator instance.
   */
  migrator = new Migrator()

  /**
   * Other migrations that should be run before this migration.
   */
  abstract dependencies: string[]

  abstract up(): Promise<void>

  abstract down(): Promise<void>
}

class Migrator {
  createTable(name: string, callback: (table: Pick<Table, 'addColumn'>) => Array<ReturnType<Table['addColumn']>>) {
    let table = new Table()
    const cols = callback(table)
    console.log(cols)
    return `CREATE TABLE ${name} (
      ${cols.map(col => {
      if (col.op === 'add') {
        return `${col.name} ${col.type} ${col.primaryKey ? 'PRIMARY KEY' : ''} ${!col.nullable ? 'NOT NULL' : ''}`.trim()
      }
    }).join(',\n')}
    )`
  }

  alterTable(name: string, callback: (table: Table) => any[]) {
    let table = new Table()
    const cols = callback(table)
    console.log(cols)
    return `ALTER TABLE ${name} (
      ${cols.map(col => {
      if (col.op === 'add') {
        return `ADD COLUMN ${col.name} ${col.type} ${col.primaryKey ? 'PRIMARY KEY' : ''} ${!col.nullable ? 'NOT NULL' : ''}`.trim()
      } else if (col.op === 'alter') {
        return `ALTER COLUMN ${col.name} ${col.type} ${col.primaryKey ? 'PRIMARY KEY' : ''} ${!col.nullable ? 'NOT NULL' : ''}`.trim()
      } else if (col.op === 'rename') {
        return `RENAME COLUMN ${col.name} TO ${col.newName}`
      } else if (col.op === 'drop') {
        return `DROP COLUMN ${col.name}`
      }
    }).join(',\n')}
    )`

  }

  renameTable(name: string, newName: string) {
    return `ALTER TABLE ${name} RENAME TO ${newName}`
  }

  dropTable(name: string) {
    return `DROP TABLE ${name}`
  }

  createIndex(name: string, table: string, columns: string[]) {
    return `CREATE INDEX ${name} ON ${table} (${columns.join(', ')})`
  }

  dropIndex(name: string) {
    return `DROP INDEX ${name}`
  }

  createSequence(name: string, start: number = 1, increment: number = 1) {
    return `CREATE SEQUENCE ${name} START ${start} INCREMENT ${increment}`
  }

  dropSequence(name: string) {
    return `DROP SEQUENCE ${name}`
  }

  createExtension(name: string) {
    return `CREATE EXTENSION ${name}`
  }

  dropExtension(name: string) {
    return `DROP EXTENSION ${name}`
  }

  runJS(func: () => void) {
    func()
  }

  runSQL(sql: string) {
    return sql
  }
}


interface ColumnOptions {
  primaryKey?: boolean
  nullable?: boolean
  unique?: boolean
  default?: any
  check?: string
}


class Table {
  addColumn(name: string, type: string, options: ColumnOptions = {}) {
    return {
      name,
      type,
      op: 'add',
      primaryKey: options.primaryKey ?? false,
      nullable: options.nullable ?? false,
    }
  }

  dropColumn(name: string) {
    return {
      name,
      op: 'drop',
    }
  }

  alterColumn(name: string, type: string, options: ColumnOptions = {}) {
    return {
      name,
      type,
      op: 'alter',
      primaryKey: options.primaryKey ?? false,
      nullable: options.nullable ?? false,
    }
  }

  renameColumn(name: string, newName: string) {
    return {
      name,
      newName,
      op: 'rename',
    }
  }

  addCheck(name: string) {
  }

  dropCheck(name: string) {
  }
}

class Index {
  addColumn(name: string) {
  }

  dropColumn(name: string) {
  }
}
