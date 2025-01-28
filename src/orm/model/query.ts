import type { Constructable } from 'mixwith.ts'
import type { FlattenAttributes, Model, ModelAttributes } from '.'

type ArrayOperator = '$in' | '$nin'
type NullOperator = '$null' | '$notNull'
type LogicalOperator = '$and' | '$or' | '$not'
type StringOperator = '$like' | '$notLike' | '$ilike' | '$notIlike'
type ComparisonOperator = '$eq' | '$neq' | '$gt' | '$gte' | '$lt' | '$lte'

type FieldOperators<T> = {
  [P in ComparisonOperator | StringOperator]?: T
} & {
  [P in ArrayOperator]?: T[]
} & {
  [P in NullOperator]?: boolean
}

type FilterQuery<TModel extends typeof Model> = {
  [P in keyof FlattenAttributes<ModelAttributes<TModel>>]?: FlattenAttributes<ModelAttributes<TModel>>[P] | FieldOperators<FlattenAttributes<ModelAttributes<TModel>>[P]>
} & {
  [P in LogicalOperator]?: P extends '$not'
    ? FilterQuery<TModel>
    : Array<FilterQuery<TModel>>
}

type OrderByQuery<TModel extends typeof Model> = {
  [P in keyof FlattenAttributes<ModelAttributes<TModel>>]?: 'asc' | 'desc'
}

export interface IQuery<M extends typeof Model, TModel extends Model = InstanceType<M>> extends Promise<TModel[] | TModel> {
  get: (filter: FilterQuery<M>) => Promise<TModel[]>
  all: () => Promise<TModel[]>
  first: () => Promise<TModel>
  last: () => Promise<TModel>
  count: () => Promise<number>
  limit: (n: number) => Promise<TModel[]>
  offset: (n: number) => Promise<TModel[]>
  filter: (filter: FilterQuery<M>) => Promise<TModel[]>
  exclude: (filter: FilterQuery<M>) => Promise<TModel[]>
  orderBy: (field: keyof TModel, direction: 'asc' | 'desc') => Promise<TModel[]>
  exists: () => Promise<boolean>
  distinct: (field: keyof TModel) => Promise<TModel[]>
  annotate: (field: keyof TModel, alias: string) => Promise<TModel[]>
  aggregate: (field: keyof TModel, alias: string) => Promise<TModel[]>
  pick: (fields: (keyof TModel)[]) => Promise<TModel[]>
  omit: (fields: (keyof TModel)[]) => Promise<TModel[]>
  rows: () => Promise<[string, TModel][]>

  create: (data: Partial<TModel>) => Promise<TModel>
  update: (data: Partial<TModel>) => Promise<TModel[]>
  ensure: (data: Partial<TModel>) => Promise<TModel>
  upsert: (data: Partial<TModel>) => Promise<TModel>
  delete: () => Promise<number>

  bulkCreate: (data: Partial<TModel>[]) => Promise<TModel[]>
  bulkUpdate: (data: Partial<TModel>[]) => Promise<TModel[]>
  bulkDelete: () => Promise<number>

  bulkEnsure: (data: Partial<TModel>[]) => Promise<TModel[]>
  bulkUpsert: (data: Partial<TModel>[]) => Promise<TModel[]>

  [Symbol.toStringTag]: 'QueryPromise'
  [Symbol.iterator]: () => Iterator<TModel>
  [Symbol.asyncIterator]: () => AsyncIterator<TModel>
}

export class Query<M extends typeof Model, TModel extends Model = InstanceType<M>> implements Promise<TModel[] | TModel> {
  private _conditions: FilterQuery<M>[] = []
  private _limit?: number = undefined
  private _offset?: number = undefined
  private _orderBy: OrderByQuery<M>[] = []
  private _pickedFields: (keyof FlattenAttributes<ModelAttributes<M>>)[] = []
  private _omittedFields: (keyof FlattenAttributes<ModelAttributes<M>>)[] = []
  private _executed: boolean = false
  private _asRows: boolean = false

  private _results: TModel[] = []

  constructor(private model: M) {}

  private _clone(): Query<M, TModel> {
    const newQuery = new Query<M, TModel>(this.model)
    newQuery._conditions = [...this._conditions]
    newQuery._limit = this._limit
    newQuery._offset = this._offset
    newQuery._orderBy = [...this._orderBy]
    newQuery._pickedFields = [...this._pickedFields]
    newQuery._omittedFields = [...this._omittedFields]
    newQuery._executed = this._executed
    newQuery._asRows = this._asRows
    return newQuery
  }

  private async _execute(): Promise<void> {
    if (this._executed) return
    this._results = []
    this._executed = true
  }

  public then<TResult1 = Array<TModel>, TResult2 = never>(
    onfulfilled?: ((value: Array<TModel>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.all().then(onfulfilled, onrejected)
  }

  public catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<Array<TModel> | TResult> {
    return this.all().catch(onrejected)
  }

  public finally(onfinally?: (() => void) | null): Promise<Array<TModel>> {
    return this.all().finally(onfinally)
  }

  get [Symbol.toStringTag]() {
    return 'QueryPromise' as const
  }

  [Symbol.iterator]() {
    return [][Symbol.iterator]()
  }

  async *[Symbol.asyncIterator]() {
    const results = await this
    yield * results
  }

  public rows(): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._asRows = true
    return newQuery
  }

  public async count(): Promise<number> {
    // // If we have cached results and they represent the complete set
    // // (no limit/offset in the query), use them

    // // If we have a cached count and no changes to the query that would affect it
    // if (this.cachedCount !== undefined) {
    //   return this.cachedCount
    // }

    // const { sql, params } = this.toCountSQL()
    // const result = await db.prepare(sql).get(...params) as { count: number }
    // this.cachedCount = result.count
    // return this.cachedCount

    return 0
  }

  public pick(fields: (keyof FlattenAttributes<ModelAttributes<M>>)[]): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._pickedFields = fields
    return newQuery
  }

  public omit(fields: (keyof FlattenAttributes<ModelAttributes<M>>)[]): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._omittedFields = fields
    return newQuery
  }

  public limit(value: number): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._limit = value
    return newQuery
  }

  public offset(value: number): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._offset = value
    return newQuery
  }

  public async all(): Promise<TModel[]> {
    await this._execute()
    return this._results
  }

  public async get(filter: FilterQuery<M>): Promise<TModel> {
    const result = await this._clone().filter(filter)
    if (result.length === 0) {
      throw new Error('DoesNotExist')
    }
    if (result.length > 1) {
      throw new Error('MultipleObjectsReturned')
    }
    return result[0]!
  }

  public async first(): Promise<TModel | null> {
    const results = await this.limit(1)
    return (results.length > 0 ? results[0] : null) ?? null
  }

  public async last(): Promise<TModel | null> {
    const results = await this.limit(1).offset(-1)
    return (results.length > 0 ? results[0] : null) ?? null
  }

  public filter(filter: FilterQuery<M>): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._conditions.push(filter)
    return newQuery
  }

  public exclude(filter: FilterQuery<M>): Query<M, TModel> {
    const newQuery = this._clone()
    newQuery._conditions.push({ $not: filter })
    return newQuery
  }

  public async orderBy(ordering: OrderByQuery<M>): Promise<TModel[]> {
    const newQuery = this._clone()
    newQuery._orderBy.push(ordering)
    return newQuery
  }

  public async exists(): Promise<boolean> {
    const results = await this.limit(1)
    return results.length > 0
  }

  public async distinct(field: keyof TModel): Promise<TModel[]> {
    return []
  }

  public async annotate(field: keyof TModel, alias: string): Promise<TModel[]> {
    return []
  }

  public async aggregate(field: keyof TModel, alias: string): Promise<TModel[]> {
    return []
  }

  public async create(data: ModelAttributes<M>): Promise<TModel> {
    return {} as TModel
  }

  public async update(data: ModelAttributes<M>): Promise<TModel[]> {
    return []
  }

  public async ensure(data: Partial<TModel>): Promise<TModel> {
    return {} as TModel
  }

  public async upsert(data: Partial<TModel>): Promise<TModel> {
    return {} as TModel
  }

  public async delete(): Promise<number> {
    return 0
  }

  public async bulkCreate(data: Partial<TModel>[]): Promise<TModel[]> {
    return []
  }

  public async bulkUpdate(data: Partial<TModel>[]): Promise<TModel[]> {
    return []
  }

  public async bulkDelete(): Promise<number> {
    return 0
  }

  public async bulkEnsure(data: Partial<TModel>[]): Promise<TModel[]> {
    return []
  }

  public async bulkUpsert(data: Partial<TModel>[]): Promise<TModel[]> {
    return []
  }
}
