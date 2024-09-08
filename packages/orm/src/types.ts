// TODO: rename IModel to IModelConstructor and IRow to IModel

export type ColumnOptions = {
  primaryKey: boolean
  columnName: string
  nullable: boolean
  unique: boolean
  dbIndex: boolean
  defaultValue: any

  meta?: any

  /**
  * Invoked before create or update happens
  */
  prepare?: (value: any, attribute: string, row: IRow) => any

  /**
   * Invoked when row is fetched from the database
   */
  consume?: (value: any, attribute: string, row: IRow) => any
}

export type ModelColumnOptions = ColumnOptions & {
  hasGetter: boolean
  hasSetter: boolean
}

/**
 * Decorator function
 */
export type DecoratorFn = (target: any, property: any) => void

/**
 * Typed decorator
 */
export type TypedDecorator<PropType> = <
  TKey extends string,
  TTarget extends { [K in TKey]: PropType },
>(
  target: TTarget,
  property: TKey
) => void

/**
 * Typed decorator that also represents an optional property
 */
export type OptionalTypedDecorator<PropType> = <
  TKey extends string,
  TTarget extends { [K in TKey]?: PropType },
>(
  target: TTarget,
  property: TKey
) => void


export interface ModelObject {
  [key: string]: any
}

/**
 * Shape of cache node to keep getters optimized
 */
export type CacheNode = {
  original: any
  resolved: any
  getter: (value: any) => any
}

export interface INamingStrategy {
  tableName(model: IModel): string
  columnName(model: IModel, attributeName: string): string
}

export interface IModelKeys {
  add(key: string, value: string): void
  get(key: string, defaultValue: string): string
  get(key: string, defaultValue?: string): string | undefined
  resolve(key: string): string
  all(): ModelObject
}


export interface IQueryset<TModel extends IModel, TResult extends IRow = InstanceType<TModel>> {

  /**
   * Reference to the model
   */
  query: any

  /**
   * Execute the query
   */

  toSQL(): string

  create(values: Partial<ModelAttributes<TResult>>): Promise<TResult>
  update(values: Partial<ModelAttributes<TResult>>): Promise<number>
  delete(): Promise<number>

  bulkCreate(values: Partial<ModelAttributes<TResult>[]>): Promise<TResult[]>
  bulkUpdate(values: Partial<ModelAttributes<TResult>[]>): Promise<number>
  bulkDelete(): Promise<number>

  earliest(): TResult | null
  latest(): TResult | null
  first(): TResult | null
  last(): TResult | null
  get(
    condition: Partial<ModelAttributesWithOperators<TResult>>
  ): TResult | null

  aggregate(): Record<string, any>
  annotate(): this

  all(): this
  none(): this
  filter(condition: Partial<ModelAttributesWithOperators<TResult>>): this
  exclude(condition: Partial<ModelAttributesWithOperators<TResult>>): this

  count(field?: keyof ModelAttributes<TResult> | number): number
  exists(): boolean

  union(qs: this, opts: any): this
  intersection(qs: this, opts: any): this
  difference(qs: this, opts: any): this

  sort(...fields: (keyof ModelAttributesWithSort<TResult>)[]): this
  distinct(field?: keyof ModelAttributes<TResult>): this
  reverse(): this
  defer(): this
  only(...fields: (keyof ModelAttributes<TResult>)[]): this

  selectRelated(): this
  prefetchRelated(): this

  values(...fields: (keyof ModelAttributes<TResult>)[]): this
  valuesList(field: keyof ModelAttributes<TResult>, opts: { flat: boolean }): any[]
}

export interface IRelation<TParent extends IModel, TRelated extends IModel> {
  readonly realtionType: 'OneToOne' | 'OneToMany' | 'ManyToMany' | 'ManyToOne'
  readonly relationName: string
  readonly parentModel: TParent
  readonly relatedModel: TRelated
  readonly onDelete: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION'
}

export interface IOneToOneRelation<TParent extends IModel, TRelated extends IModel> extends IRelation<TParent, TRelated> {
  readonly realtionType: 'OneToOne'
  readonly parentKey: string
  readonly relatedKey: string
}

export interface IModel {
  /**
   * Whether or not model has been booted. After this model configurations
   * are ignored
   */
  readonly booted: boolean

  /**
 * Naming strategy to use
 */
  namingStrategy: INamingStrategy

  /**
   * Database table to use
   */
  table: string

  /**
* The primary key for finding unique referencing to a
* model
*/
  primaryKey: string

  /**
   * A map of defined columns
   */
  $columnsDefinitions: Map<string, ModelColumnOptions>

  /**
   * A map of defined relationships
   */
  // $relationsDefinitions: Map<string, RelationshipsContract>
  $relationsDefinitions: Map<string, any>

  /**
  * A copy of internal keys mapping. One should be able to resolve between
  * all key versions
  */
  $keys: {
    attributesToColumns: IModelKeys
    columnsToAttributes: IModelKeys
  }

  /**
   * Managing columns
   */
  $addColumn(name: string, options: Partial<ColumnOptions>): ColumnOptions
  $hasColumn(name: string): boolean
  $getColumn(name: string): ModelColumnOptions | undefined

  // TODO: Add relationships
  $addRelation(name: string, relation: any): void
  $hasRelation(name: string): boolean
  $getRelation(name: string): any

  /**
   * Define a static property on the model using the inherit or
   * define strategy.
   *
   * Inherit strategy will clone the property from the parent model
   * and will set it on the current model
   */
  $defineProperty<TModel extends IModel, Prop extends keyof TModel>(
    this: TModel,
    propertyName: Prop,
    defaultValue: TModel[Prop],
    strategy: 'inherit' | 'define' | ((value: TModel[Prop]) => TModel[Prop])
  ): void

  /**
   * Boot model
   */
  boot(): void

  new(): IRow

  query<TModel extends IModel, TResult extends IRow = InstanceType<TModel>>(this: TModel): IQueryset<TModel, TResult>
}

/**
 * A complex type that filters out functions and relationships from the
 * model attributes and consider all other properties as database
 * columns. Alternatively, the user can self define a `$columns`
 * property.
 */
export type ModelAttributes<TModel extends IRow> = {
  [Filtered in {
    [P in keyof TModel]: P extends keyof IRow
    ? never
    : TModel[P] extends Function // | ModelRelationTypes
    ? never
    : P
  }[keyof TModel]]: TModel[Filtered]
}

type Relations<TModel extends IRow> = TModel extends { constructor: { name: infer N } }
  ? N extends keyof RelationMap
  ? RelationMap[N]
  : never
  : never;

// type Relations<TModel extends IRow> = RelationMap[Extract<TModel["constructor"]["name"], keyof RelationMap>];


type SingularOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'like' | 'notLike' | 'ilike' | 'notILike' | 'isNull' | 'isNotNull'
type BetweenOperator = 'between' | 'notBetween'
type PluralOperator = 'in' | 'notIn'

export type ModelAttributesWithOperators<TModel extends IRow> = {
  [P in keyof ModelAttributes<TModel>]: ModelAttributes<TModel>[P]
} & {
    [P in keyof ModelAttributes<TModel> as `${P & string}:${SingularOperator}`]: ModelAttributes<TModel>[P]
  } & {
    [P in keyof ModelAttributes<TModel> as `${P & string}:${BetweenOperator}`]: [ModelAttributes<TModel>[P], ModelAttributes<TModel>[P]]
  } & {
    [P in keyof ModelAttributes<TModel> as `${P & string}:${PluralOperator}`]: ModelAttributes<TModel>[P][]
  } & {
    $or: ModelAttributesWithOperators<TModel>
    $and: ModelAttributesWithOperators<TModel>
  }

type SortDirection = 'asc' | 'desc'
export type ModelAttributesWithSort<TModel extends IRow> = {
  [P in keyof ModelAttributes<TModel>]: never
} & {
    [P in keyof ModelAttributes<TModel> as `${P & string}:${SortDirection}`]: never
  }



export interface IRow {
  $attributes: ModelObject
  $extras: ModelObject

  /**
   * Read/write attributes. Following methods are intentionally loosely typed,
   * so that one can bypass the public facing API and type checking for
   * advanced use cases
   */
  $setAttribute(key: string, value: any): void
  $getAttribute(key: string): any
  // $getAttributeFromCache(key: string, callback: CacheNode['getter']): any

  // TODO: Add relationships

  /**
  * Actions to perform on the instance
  */
  save(): Promise<this>

  fill(value: Partial<ModelAttributes<this>>, allowExtraProperties?: boolean): this
  // merge(value: Partial<ModelAttributes<this>>, allowExtraProperties?: boolean): this

  query(): IQueryset<IModel, this>
  // objects: IQueryset<IModel, this>

  // constructor: IModel
  // [key: keyof RelationMap[keyof Models]]: string
  // [key: string]: any; // Allow other keys of any type

}
