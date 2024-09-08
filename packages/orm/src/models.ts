import { defineStaticProperty } from '@poppinss/utils'
import { CamelCaseNamingStrategy } from './naming-strategy'

import type { ColumnOptions, IModel, IModelKeys, IQueryset, IRow, ModelAttributes, ModelColumnOptions, ModelObject } from './types'
import { ModelKeys } from './model-keys'
import { Queryset } from './queryset'
import { isObject } from './utils'

const StaticImplements = <T>() => (_t: T) => { }

// TODO: https://github.com/microsoft/TypeScript/issues/5863

const proxyHandler: ProxyHandler<any> = {
  get(target: any, key: any, receiver: any) {
    const Model = target.constructor as IModel
    const column = Model.$getColumn(key)

    // if (key === 'query' && Model.query) { return Model.query }

    /**
     * Fetch the attribute value, when attribute exists and
     * doesn't have a getter
     */
    if (column && !column.hasGetter) {
      const attributeValue = target.$getAttribute(key)
      if (attributeValue === undefined) {
        return Reflect.get(target, key, receiver)
      }

      return attributeValue
    }

    return Reflect.get(target, key, receiver)
  },

  set(target: any, key: any, value: any, receiver: any) {
    const Model = target.constructor as IModel
    const column = Model.$getColumn(key)

    /**
     * Set value as an attribute when column is defined and
     * their isn't any setter for it.
     */
    if (column && !column.hasSetter) {
      target.$setAttribute(key, value)
      Reflect.set(target, key, value, receiver)
      return true
    }

    return Reflect.set(target, key, value, receiver)
  },

  defineProperty(target: any, key: any, value: any) {
    const Model = target.constructor as IModel
    const column = Model.$getColumn(key)

    /**
     * Set the attribute along side defining the property
     */
    if (column && !column.hasSetter && value.value !== undefined) {
      target.$setAttribute(key, value.value)
    }

    return Reflect.defineProperty(target, key, value)
  },
}

@StaticImplements<IModel>()
class ModelImpl implements IRow {
  /**
 * Whether the model has been booted. Booting the model initializes its
 * static properties. Base models must not be initialized.
 */
  static booted: boolean

  /**
   * Naming strategy for model properties
   */
  static namingStrategy = new CamelCaseNamingStrategy()


  /**
  * The name of database table. It is auto generated from the model name, unless
  * specified
  */
  static table: string

  /**
   * Primary key is required to build relationships across models
   */
  static primaryKey: string

  /**
   * Columns makes it easier to define extra props on the model
   * and distinguish them with the attributes to be sent
   * over to the adapter
   */
  static $columnsDefinitions: Map<string, ModelColumnOptions>

  /**
   * Registered relationships for the given model
   */
  // static $relationsDefinitions: Map<string, RelationshipsContract>
  static $relationsDefinitions: Map<string, any>


  /**
   * Keys mappings to make the lookups easy
   */
  static $keys: {
    attributesToColumns: IModelKeys
    columnsToAttributes: IModelKeys
  }

  /**
 * Define a new column on the model. This is required, so that
 * we differentiate between plain properties vs model attributes.
 */
  static $addColumn(name: string, options: Partial<ColumnOptions>) {
    const descriptor = Object.getOwnPropertyDescriptor(this.prototype, name)

    const column: ModelColumnOptions = {
      primaryKey: options.primaryKey || false,
      columnName: options.columnName || this.namingStrategy.columnName(this, name),
      hasGetter: !!(descriptor && descriptor.get),
      hasSetter: !!(descriptor && descriptor.set),
      nullable: options.nullable || false,
      unique: options.unique || false,
      dbIndex: options.dbIndex || false,
      defaultValue: options.defaultValue || options.nullable ? null : undefined,
      meta: options.meta || {},
      prepare: options.prepare,
      consume: options.consume,
    }

    /**
     * Set column as the primary column, when `primary` is true
     */
    if (column.primaryKey) {
      this.primaryKey = name
    }

    this.$columnsDefinitions.set(name, column)

    this.$keys.attributesToColumns.add(name, column.columnName)
    this.$keys.columnsToAttributes.add(column.columnName, name)

    return column
  }

  /**
   * Returns a boolean telling if column exists on the model
   */
  static $hasColumn(name: string): boolean {
    return this.$columnsDefinitions.has(name)
  }

  /**
   * Returns the column for a given name
   */
  static $getColumn(name: string): ModelColumnOptions | undefined {
    return this.$columnsDefinitions.get(name)
  }

  static $addRelation(name: string, relation: any) {
    this.$relationsDefinitions.set(name, relation)
  }

  static $hasRelation(name: string): boolean {
    return this.$relationsDefinitions.has(name)
  }

  static $getRelation(name: string): any {
    return this.$relationsDefinitions.get(name)
  }

  /**
 * Define a static property on the model using the inherit or
 * define strategy.
 *
 * Inherit strategy will clone the property from the parent model
 * and will set it on the current model
 */
  static $defineProperty<TModel extends IModel, Prop extends keyof TModel>(
    this: TModel,
    propertyName: Prop,
    defaultValue: TModel[Prop],
    strategy: 'inherit' | 'define' | ((value: TModel[Prop]) => TModel[Prop])
  ) {
    defineStaticProperty(this, propertyName, {
      initialValue: defaultValue,
      strategy: strategy,
    })
  }


  /**
 * Boot the model
 */
  static boot() {
    /**
     * Define the property when not defined on self
     */
    if (!this.hasOwnProperty('booted')) {
      this.booted = false
    }

    /**
     * Return when already booted
     */
    if (this.booted === true) {
      return
    }

    this.booted = true

    /**
     * Table name is never inherited from the base model
     */
    this.$defineProperty('table', this.namingStrategy.tableName(this), 'define')

    /**
     * Inherit primary key or default to "id"
     */
    this.$defineProperty('primaryKey', 'id', 'inherit')

    /**
     * Define the keys' property. This allows looking up variations
     * for model keys
     */
    this.$defineProperty(
      '$keys',
      {
        attributesToColumns: new ModelKeys(),
        columnsToAttributes: new ModelKeys(),
      },
      (value) => {
        return {
          attributesToColumns: new ModelKeys(Object.assign({}, value.attributesToColumns.all())),
          columnsToAttributes: new ModelKeys(Object.assign({}, value.columnsToAttributes.all())),
        }
      }
    )

    /**
     * Define columns
     */
    this.$defineProperty('$columnsDefinitions', new Map(), 'inherit')

    /**
     * Define relationships
     */
    this.$defineProperty('$relationsDefinitions', new Map(), 'inherit')
  }

  $attributes: ModelObject = {}
  $extras: ModelObject = {}

  /**
 * When `fill` method is called, then we may have a situation where it
 * removed the values which exists in `original` and hence the dirty
 * diff has to do a negative diff as well
 */
  private fillInvoked: boolean = false

  /**
  * Set attribute
  */
  $setAttribute(key: string, value: any) {
    this.$attributes[key] = value
  }

  /**
   * Get value of attribute
   */
  $getAttribute(key: string): any {
    return this.$attributes[key]
  }

  constructor() {
    return new Proxy(this, proxyHandler)
  }

  static query(): any {
    return new Queryset(this)
  }

  query = ModelImpl.query

  async save(): Promise<this> {
    return this
  }

  /**
   * Set bulk attributes on the model instance. Setting relationships via
   * fill isn't allowed, since we disallow setting relationships
   * locally
   */
  fill(values: any, allowExtraProperties: boolean = false): this {
    this.$attributes = {}
    this.merge(values, allowExtraProperties)
    this.fillInvoked = true
    return this
  }

  /**
   * Merge bulk attributes with existing attributes.
   *
   * 1. If key is unknown, it will be added to the `extras` object.
   * 2. If key is defined as a relationship, it will be ignored and one must call `$setRelated`.
   */
  private merge(values: any, allowExtraProperties: boolean = false): this {
    const M = this.constructor as typeof Model

    /**
     * Merge values with the attributes
     */
    if (isObject(values)) {
      Object.keys(values).forEach((key) => {
        const value = values[key]

        /**
         * Set as column
         */
        if (M.$hasColumn(key)) {
          ; (this as any)[key] = value
          return
        }

        /**
         * Resolve the attribute name from the column names. Since people
         * usually define the column names directly as well by
         * accepting them directly from the API.
         */
        const attributeName = M.$keys.columnsToAttributes.get(key)
        if (attributeName) {
          ; (this as any)[attributeName] = value
          return
        }

        /**
         * If key is defined as a relation, then ignore it, since one
         * must pass a qualified model to `this.$setRelated()`
         */
        if (M.$relationsDefinitions.has(key)) {
          return
        }

        /**
         * If the property already exists on the model, then set it
         * as it is vs defining it as an extra property
         */
        if (this.hasOwnProperty(key)) {
          ; (this as any)[key] = value
          return
        }

        /**
         * Raise error when not instructed to ignore non-existing properties.
         */
        if (!allowExtraProperties) {
          throw new Error(
            `Cannot define "${key}" on "${M.name}" model, since it is not defined as a model property`
          )
        }

        this.$extras[key] = value
      })
    }

    return this
  }


  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  toString() {
    return this.constructor.name
  }

  toJSON(): any {
    return {}
  }
}

export const Model: IModel = ModelImpl
