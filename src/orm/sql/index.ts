// Core types for database operations
type Dialect = 'postgres' | 'mysql' | 'sqlite' | 'mssql'

interface DatabaseConfig {
  dialect: Dialect
  host: string
  port: number
  username: string
  password: string
  database: string
}

interface Connection {
  dialect: Dialect
  exec: (query: string, params?: any[]) => Promise<any>
  prepare: (query: string) => PreparedStatement
  transaction: () => Transaction
}

interface PreparedStatement {
  execute: (params?: any[]) => Promise<any>
  close: () => Promise<void>
}

interface Transaction {
  begin: () => Promise<void>
  commit: () => Promise<void>
  rollback: () => Promise<void>
  exec: (query: string, params?: any[]) => Promise<any>
}

// Query builder interfaces
interface QueryBuilder {
  select: () => SelectBuilder
  insert: () => InsertBuilder
  update: () => UpdateBuilder
  delete: () => DeleteBuilder
  raw: (sql: string, params?: any[]) => RawBuilder
}

// Helper types

// Example usage:
/*
const db = new Database(config);
const connection = await db.connect();
const compiler = new SQLCompiler(connection);

// Simple select
const users = await compiler
  .select()
  .columns(['id', 'name', 'email'])
  .from('users')
  .where({ active: true })
  .execute();

// Complex join
const orders = await compiler
  .select()
  .columns(['o.id', 'u.name', 'o.total'])
  .from('orders o')
  .join('users u', { 'o.user_id': 'u.id' })
  .where({ 'o.status': 'pending' })
  .orderBy([{ column: 'o.created_at', direction: 'DESC' }])
  .execute();

// Transaction example
const trx = await connection.transaction();
try {
  await compiler
    .insert()
    .into('users')
    .values({ name: 'John', email: 'john@example.com' })
    .execute();

  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
*/

// Column Types and Constraints
type ColumnType =
  | 'integer'
  | 'bigint'
  | 'text'
  | 'varchar'
  | 'boolean'
  | 'timestamp'
  | 'date'
  | 'jsonb'
  | 'uuid'
  | 'decimal'
  | 'float'

// DDL Builder interfaces
interface SchemaBuilder {
  createTable: (name: string) => CreateTableBuilder
  alterTable: (name: string) => AlterTableBuilder
  dropTable: (name: string) => DropTableBuilder
  createIndex: (tableName: string) => CreateIndexBuilder
  dropIndex: (indexName: string, tableName: string) => DropIndexBuilder
  raw: (sql: string) => RawBuilder
}

// Updated main compiler class
class SQLCompiler implements QueryBuilder, SchemaBuilder {
  constructor(private connection: Connection) {}

  // raw
  raw(sql: string, params?: any[]): RawBuilder {
    return new RawQueryBuilder(this.connection, sql, params)
  }

  // DML methods
  select(): SelectBuilder {
    return new SelectQueryBuilder(this.connection)
  }

  insert(): InsertBuilder {
    return new InsertQueryBuilder(this.connection)
  }

  update(): UpdateBuilder {
    return new UpdateQueryBuilder(this.connection)
  }

  delete(): DeleteBuilder {
    return new DeleteQueryBuilder(this.connection)
  }

  // DDL methods
  createTable(name: string): CreateTableBuilder {
    return new CreateTableBuilder(this.connection, name)
  }

  alterTable(name: string): AlterTableBuilder {
    return new AlterTableBuilder(this.connection, name)
  }

  dropTable(name: string): DropTableBuilder {
    return new DropTableBuilder(this.connection, name)
  }

  createIndex(tableName: string): CreateIndexBuilder {
    return new CreateIndexBuilder(this.connection, tableName)
  }

  dropIndex(indexName: string, tableName: string): DropIndexBuilder {
    return new DropIndexBuilder(this.connection, indexName, tableName)
  }
}

// Example usage:
/*
const compiler = new SQLCompiler(connection);

// Create table
await compiler
  .createTable('users')
  .ifNotExists()
  .columns([
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true,
      defaultValue: 'uuid_generate_v4()'
    },
    {
      name: 'email',
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false
    },
    {
      name: 'created_at',
      type: 'timestamp',
      defaultValue: 'CURRENT_TIMESTAMP'
    }
  ])
  .execute();

// Add index
await compiler
  .createIndex('users')
  .ifNotExists()
  .unique()
  .on(['email'])
  .execute();

// Alter table
await compiler
  .alterTable('users')
  .addColumn({
    name: 'last_login',
    type: 'timestamp',
    nullable: true
  })
  .execute();

// Create table with foreign key
await compiler
  .createTable('posts')
  .columns([
    {
      name: 'id',
      type: 'uuid',
      primaryKey: true
    },
    {
      name: 'user_id',
      type: 'uuid',
      references: {
        table: 'users',
        column: 'id',
        onDelete: 'CASCADE'
      }
    },
    {
      name: 'content',
      type: 'text'
    }
  ])
  .execute();
*/
