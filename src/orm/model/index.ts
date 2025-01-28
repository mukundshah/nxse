import type { NamingStrategy } from '@/common'
import type { IColumn, IRelatedColumn } from '@/fields'

import { Query } from './query'

// export interface IModelConstructor {
//   new (data?: Record<string, any>): IModel
//   $tableName: string
//   $columns: Record<string, IColumn<unknown> | IRelatedColumn<typeof Model>>
//   $namingStrategy: NamingStrategy

//   get query(): Query<typeof this>
// }

export interface IModel {
  toString: () => string
  toJSON: () => Record<string, any>
  save: () => Promise<void>
  delete: () => Promise<void>
}

export type ModelAttributes<TModel extends typeof Model> = {
  [P in keyof TModel['$columns']]:
  TModel['$columns'][P] extends IColumn
    ? TModel['$columns'][P]['_'] extends { $type: infer U } ? U : TModel['$columns'][P]['_']['data']
    : TModel['$columns'][P] extends IRelatedColumn<infer T>
      ? InstanceType<T>
      : never
} & {
  [P in keyof TModel['$columns'] as
  TModel['$columns'][P] extends IRelatedColumn<any>
    ? P extends string
      ? `${P}_id`
      : never
    : never
  ]: TModel['$columns'][P] extends IRelatedColumn<infer T>
    ? T['$columns']['id'] extends IColumn<infer U>
      ? U
      : never
    : never
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type FlattenAttributes<T, Prefix extends string = ''> = UnionToIntersection<{
  [K in keyof T]: T[K] extends { [key: string]: any }
    ? T[K] extends typeof Model
      ? FlattenAttributes<T[K], `${Prefix}${K & string}.`>
      : { [Key in `${Prefix}${K & string}`]: T[K] }
    : { [Key in `${Prefix}${K & string}`]: T[K] }
}[keyof T]>

// function StaticImplements<T>() {
//   return (_t: T) => {}
// }

// @StaticImplements<IModelConstructor>()
export abstract class Model implements IModel {
  public static $tableName: string | null = null
  public static $columns: Record<string, IColumn | IRelatedColumn<typeof Model>> = {}
  public static $namingStrategy: NamingStrategy = 'snake_case'

  constructor(data?: never) {
    Object.assign(this, data)

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return (target as any)[prop]
        }
        if (prop in (target.constructor as typeof Model).$columns) {
          (target as any)[prop] = null
          return (target as any)[prop]
        }
        return undefined
      },
      set(target, prop, value) {
        if (prop in (target.constructor as typeof Model).$columns) {
          // const columnType = (this.constructor as typeof Model).$columns[prop].type;
          // if (typeof value !== columnType) {
          //   throw new TypeError(`Invalid type for ${prop}: expected ${columnType}, but got ${typeof value}`);
          // }
          (target as any)[prop] = value
          return true
        }
        return false
      },
    })
  }

  static query<M extends typeof Model>(this: M) {
    return new Query<typeof this>(this)
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  toJSON() {
    const obj: Record<string, any> = {}
    for (const key of Object.keys((this.constructor as typeof Model).$columns)) {
      obj[key] = (this as any)[key]
    }
    return obj
  }

  toString() {
    return `${this.constructor.name} <${JSON.stringify(this.toJSON())}>`
  }

  async save() {
  }

  async delete() {
  }
}
