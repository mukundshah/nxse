import type { SQL } from '@/common'
import type { Model } from '@/model'
import type { Defu } from 'defu'

export type Simplify<T> =
  & {
    [K in keyof T]: T[K];
  }
  & {}

export type ColumnDataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'json'
  | 'date'
  | 'bigint'
  | 'custom'
  | 'buffer'

export interface ColumnBaseConfig<TData = unknown> {
  data: TData
}

export type ColumnTypeConfig<
  T extends ColumnBaseConfig,
  TTypeConfig extends object = object,
> = Simplify<
  & {
    data: T['data']
    hasDefault: T extends { hasDefault: infer U } ? U : boolean
    isNullable: T extends { isNullable: infer U } ? U : boolean
    isPrimaryKey: T extends { isPrimaryKey: infer U } ? U : boolean
    unique: T extends { unique: infer U } ? U : boolean
    index: T extends { index: infer U } ? U : boolean
    default: T extends { default: infer U } ? U : SQL | unknown | (() => unknown) | null
  }
  & TTypeConfig
>

export type ColumnRuntimeConfig<TData, TRuntimeConfig extends object = object> = {
  isPrimaryKey: boolean
  isNullable: boolean
  default: SQL | TData | (() => TData) | null
  hasDefault: boolean
  unique: boolean
  index: boolean
  dataType: string
} & TRuntimeConfig

export interface IColumn<
  T extends ColumnBaseConfig = ColumnBaseConfig<unknown>,
  TRuntimeConfig extends object = object,
  TTypeConfig extends object = object,
> {
  _: ColumnTypeConfig<T, TTypeConfig>
  get config(): Readonly<ColumnRuntimeConfig<T['data'], TRuntimeConfig>>
}

export type IsPrimaryKey<T extends IColumn> = T & {
  _: {
    isPrimaryKey: true
  }
}

export type IsNullable<T extends IColumn> = T & {
  _: {
    isNullable: true
  }
}

export type HasDefault<T extends IColumn> = T & {
  _: {
    hasDefault: true
  }
}

export type Unique<T extends IColumn> = T & {
  _: {
    unique: false
  }
}

export type Index<T extends IColumn> = T & {
  _: {
    index: true
  }
}

export type $Type<T extends IColumn, TType> = T & {
  _: {
    $type: TType
  }
}

export abstract class Column<
  TData = unknown,
  TBaseConfig extends ColumnBaseConfig<TData> = ColumnBaseConfig<TData>,
  TRuntimeConfig extends object = object,
  TTypeConfig extends object = object,
> implements IColumn<TBaseConfig, TRuntimeConfig, TTypeConfig> {
  private _isPrimaryKey: boolean = false
  private _isNullable: boolean = false
  private _unique: boolean = false
  private _index: boolean = false
  private _default: SQL | TBaseConfig['data'] | (() => TBaseConfig['data']) | null = null
  private _hasDefault: boolean = false

  declare _: ColumnTypeConfig<TBaseConfig, TTypeConfig>

  get config() {
    return Object.freeze({
      isPrimaryKey: this._isPrimaryKey,
      isNullable: this._isNullable,
      default: this._default,
      hasDefault: this._hasDefault,
      unique: this._unique,
      index: this._index,
    }) as Readonly<ColumnRuntimeConfig<TBaseConfig['data'], TRuntimeConfig>>
  }

  pk() {
    this._isPrimaryKey = true
    return this as IsPrimaryKey<this>
  }

  nullable() {
    this._isNullable = true
    return this as IsNullable<this>
  }

  default(_value: SQL | (this['_'] extends { $type: infer U } ? U | (() => U) : this['_']['data'] | (() => this['_']['data']))) {
    // this._default = value
    this._hasDefault = true
    return this as HasDefault<this>
  }

  unique() {
    this._unique = true
    return this as Unique<this>
  }

  index() {
    this._index = true
    return this as Index<this>
  }

  $type<TType>(): $Type<this, TType> {
    return this as any as $Type<this, TType>
  }
}

export class BooleanColumn extends Column<boolean> {}

export class VarcharColumn extends Column<string> {
  private _maxLength: number | undefined

  // get maxLength() {
  //   return this._maxLength
  // }

  maxLength(value: number) {
    this._maxLength = value
    return this
  }
}

export class EmailColumn extends VarcharColumn { }

export class URLColumn extends VarcharColumn { }

export class TextColumn extends Column<string> {}

export class IntegerColumn extends Column<number> { }

export class SmallIntegerColumn extends Column<number> { }

export class BigIntegerColumn extends Column<bigint> { }

export class SerialColumn extends Column<number> { }

export class SmallSerialColumn extends Column<number> { }

export class BigSerialColumn extends Column<bigint> { }

export class FloatColumn extends Column<number> { }

export class DoubleColumn extends Column<number> { }

export class NumericColumn extends Column<number> {
  private _precision: number | undefined
  private _scale: number | undefined

  constructor({ precision, scale }: { precision?: number, scale?: number } = {}) {
    super()

    if (precision && precision < 0) {
      throw new Error('Precision must be a positive integer')
    }

    if (scale && scale < 0) {
      throw new Error('Scale must be a positive integer')
    }

    if (scale && precision && scale > precision) {
      throw new Error('Scale must be less than or equal to precision ')
    }

    this._precision = precision
    this._scale = scale
  }

  get precision() {
    return this._precision
  }

  get scale() {
    return this._scale
  }
}

class DateTimeBase extends Column<Date> {
  private _autoInsert: boolean = false
  private _autoUpdate: boolean = false

  autoInsert() {
    this._autoInsert = true
    return this
  }

  autoUpdate() {
    this._autoUpdate = true
    return this
  }
}

export class DateColumn extends DateTimeBase { }

export class TimeColumn extends DateTimeBase { }

export class DateTimeColumn extends DateTimeBase { }

export class UUIDColumn extends Column<string> { }

export class JSONColumn extends Column<object> { }

export function boolean() {
  return new BooleanColumn()
}

export function varchar(maxLength?: number) {
  return maxLength ? new VarcharColumn().maxLength(maxLength) : new VarcharColumn()
}

export function email() {
  return new EmailColumn()
}

export function url() {
  return new URLColumn()
}

export function text() {
  return new TextColumn()
}

export function int() {
  return new IntegerColumn()
}

export function smallint() {
  return new SmallIntegerColumn()
}

export function bigint() {
  return new BigIntegerColumn()
}

export function serial() {
  return new SerialColumn()
}

export function smallserial() {
  return new SmallSerialColumn()
}

export function bigserial() {
  return new BigSerialColumn()
}

export function float() {
  return new FloatColumn()
}

export function double() {
  return new DoubleColumn()
}

export function numeric(precision: number, scale: number) {
  return new NumericColumn({ precision, scale })
}

export function date() {
  return new DateColumn()
}

export function time() {
  return new TimeColumn()
}

export function datetime() {
  return new DateTimeColumn()
}

export function uuid() {
  return new UUIDColumn()
}

export function json() {
  return new JSONColumn()
}

export interface IRelatedColumn<T extends typeof Model> {
  get relation(): 'ForeignKey' | 'OneToOne' | 'ManyToMany'
  get relatedModel(): T | undefined
  get isNullable(): boolean
  get onDelete(): 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION' | undefined
}

export abstract class RelatedColumnBase<T extends typeof Model> implements IRelatedColumn<T> {
  private _relatedModel: T | undefined
  private _isNullable: boolean = false
  private _onDelete: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION' | undefined
  // private _defaultValue: SQL | (() => T) | null = null

  abstract get relation(): 'ForeignKey' | 'OneToOne' | 'ManyToMany'

  constructor(relatedModel?: T) {
    this._relatedModel = relatedModel
  }

  get relatedModel() {
    return this._relatedModel
  }

  get isNullable() {
    return this._isNullable
  }

  get onDelete() {
    return this._onDelete
  }

  nullable() {
    this._isNullable = true
    return this
  }
}

export class ForeignKeyColumn<T extends typeof Model> extends RelatedColumnBase<T> {
  get relation() {
    return 'ForeignKey' as const
  }
}

export class OneToOneColumn<T extends typeof Model> extends RelatedColumnBase<T> {
  get relation() {
    return 'OneToOne' as const
  }
}

export class ManyToManyColumn<T extends typeof Model> extends RelatedColumnBase<T> {
  get relation() {
    return 'ManyToMany' as const
  }
}

export function fk<T extends typeof Model>(relatedModel: T) {
  return new ForeignKeyColumn<T>(relatedModel)
}

export function ref<T extends typeof Model>(relatedModel: T) {
  return new OneToOneColumn<T>(relatedModel)
}

export function m2m<T extends typeof Model>(relatedModel: T) {
  return new ManyToManyColumn<T>(relatedModel)
}
