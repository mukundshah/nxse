import type { ColumnOptions, DecoratorFn, IModel, OptionalTypedDecorator, TypedDecorator } from "@/types"


/**
 * Define property on a model as a column. The decorator needs a
 * proper model class inheriting the base model
 */
export const column = (options?: Partial<ColumnOptions>): DecoratorFn => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel
    Model.boot()
    Model.$addColumn(property, options || {})
  }
}


export const BooleanColumn = (
  options?: Partial<ColumnOptions>
): OptionalTypedDecorator<boolean> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'boolean'

    Model.$addColumn(property, options || {})
  }
}


export const AutoColumn = (
  options?: Partial<Omit<ColumnOptions, 'nullable'>>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'serial'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const BigAutoColumn = (
  options?: Partial<Omit<ColumnOptions, 'nullable'>>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'bigserial'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const SmallAutoColumn = (
  options?: Partial<Omit<ColumnOptions, 'nullable'>>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'smallserial'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const IntegerColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'integer'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const BigIntegerColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'bigint'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const SmallIntegerColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'smallint'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const PositiveBigIntegerColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'bigserial'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const PositiveIntegerColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'integer'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const PositiveSmallIntegerColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<number> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'smallint'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const DecimalColumn = (
  options?: Partial<ColumnOptions & { precision?: number; scale?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'numeric'
    normalizedOptions.meta.precision = options?.precision || 10
    normalizedOptions.meta.scale = options?.scale || 2

    Model.$addColumn(property, normalizedOptions)
  }
}

export const FloatColumn = (
  options?: Partial<ColumnOptions & {
    doublePrecision?: boolean;
  }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()

    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'float'
    normalizedOptions.meta.doublePrecision = options?.doublePrecision || false

    Model.$addColumn(property, normalizedOptions)
  }
}

export const BinaryColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'binary'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const CharColumn = (
  options?: Partial<ColumnOptions & { maxLength?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'varchar'
    normalizedOptions.meta.maxLength = options?.maxLength || 255

    Model.$addColumn(property, normalizedOptions)
  }
}

export const TextColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'text'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const SlugColumn = (
  options?: Partial<ColumnOptions & { maxLength?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'varchar'
    normalizedOptions.meta.maxLength = options?.maxLength || 255

    Model.$addColumn(property, normalizedOptions)
  }
}

export const EmailColumn = (
  options?: Partial<ColumnOptions & { maxLength?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'varchar'
    normalizedOptions.meta.maxLength = options?.maxLength || 255

    Model.$addColumn(property, normalizedOptions)
  }
}

export const URLColumn = (
  options?: Partial<ColumnOptions & { maxLength?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'varchar'
    normalizedOptions.meta.maxLength = options?.maxLength || 255

    Model.$addColumn(property, normalizedOptions)
  }
}


export const FilePathColumn = (
  options?: Partial<ColumnOptions & { maxLength?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'varchar'
    normalizedOptions.meta.maxLength = options?.maxLength || 255

    Model.$addColumn(property, normalizedOptions)
  }
}

export const FileColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    Model.$addColumn(property, options || {})
  }
}

export const ImageColumn = (
  options?: Partial<ColumnOptions & { maxLength?: number }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'varchar'
    normalizedOptions.meta.maxLength = options?.maxLength || 255

    Model.$addColumn(property, normalizedOptions)
  }
}

export const JSONColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'jsonb'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const IPAddressColumn = (
  options?: Partial<ColumnOptions & { version?: 'ipv4' | 'ipv6' }>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'inet'
    normalizedOptions.meta.version = options?.version || 'ipv4'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const UUIDColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
      },
      options
    )

    normalizedOptions.meta.type = 'uuid'

    Model.$addColumn(property, normalizedOptions)
  }
}

export const DateColumn = (
  options?: Partial<ColumnOptions & {
    autoCreate: boolean;
    autoUpdate: boolean;
  }>
): TypedDecorator<Date> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
        prepare: (value: any) => {
          return value
        },
        consume: (value: any) => {
          return value
        },
      },
      options
    )

    normalizedOptions.meta.type = 'date'
    normalizedOptions.meta.autoCreate = normalizedOptions.autoCreate === true
    normalizedOptions.meta.autoUpdate = normalizedOptions.autoUpdate === true


    Model.$addColumn(property, normalizedOptions)
  }
}

export const TimeColumn = (
  options?: Partial<ColumnOptions & {
    autoCreate: boolean;
    autoUpdate: boolean;
  }>
): TypedDecorator<Date> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
        prepare: (value: any) => {
          return value
        },
        consume: (value: any) => {
          return value
        },
      },
      options
    )

    normalizedOptions.meta.type = 'time'
    normalizedOptions.meta.autoCreate = normalizedOptions.autoCreate === true
    normalizedOptions.meta.autoUpdate = normalizedOptions.autoUpdate === true


    Model.$addColumn(property, normalizedOptions)
  }
}

export const DateTimeColumn = (
  options?: Partial<ColumnOptions & {
    autoCreate: boolean;
    autoUpdate: boolean;
  }>
): TypedDecorator<Date> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    const normalizedOptions = Object.assign(
      {
        meta: {},
        prepare: (value: any) => {
          return value
        },
        consume: (value: any) => {
          return value
        },
      },
      options
    )

    normalizedOptions.meta.type = 'timestamp'
    normalizedOptions.meta.autoCreate = normalizedOptions.autoCreate === true
    normalizedOptions.meta.autoUpdate = normalizedOptions.autoUpdate === true

    Model.$addColumn(property, normalizedOptions)
  }
}

export const DurationColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    Model.$addColumn(property, options || {})
  }
}

export const GeneratedColumn = (
  options?: Partial<ColumnOptions>
): TypedDecorator<string> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel

    Model.boot()
    Model.$addColumn(property, options || {})
  }
}

export const OneToOne = <TModel extends IModel>(
  options: Partial<ColumnOptions> & {
    to: () => TModel,
  }
): TypedDecorator<InstanceType<TModel>> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel
    const ToModel = options.to()
    Model.boot()
    Model.$addColumn(property, options || {})
    Model.$addRelation(property, {
      type: 'OneToOne',
      model: ToModel,
      foreignKey: options?.columnName || `${ToModel.name.toLowerCase()}_id`,
    })

    ToModel.boot()
    ToModel.$addRelation(property, {
      type: 'OneToOne',
      model: Model,
      foreignKey: options?.columnName || `${Model.name.toLowerCase()}_id`,
    })
  }
}

export const ForeignKey = <TModel extends IModel>(
  options: Partial<ColumnOptions> & {
    to: () => TModel,
  }
): TypedDecorator<InstanceType<TModel>[]> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel
    const ToModel = options.to()
    Model.boot()
    Model.$addColumn(property, options || {})

    ToModel.boot()
    ToModel.$addRelation(property, {
      type: 'OneToMany',
      model: Model,
      foreignKey: options?.columnName || `${Model.name.toLowerCase()}_id`,
    })
  }
}

export const ManyToMany = <TModel extends IModel>(
  options: Partial<ColumnOptions> & {
    to: () => TModel,
    through: () => IModel,
  }
): TypedDecorator<InstanceType<TModel>[]> => {
  return function decorateAsColumn(target, property) {
    const Model = target.constructor as IModel
    const ToModel = options.to()
    Model.boot()
    Model.$addColumn(property, options || {})

    ToModel.boot()
    ToModel.$addRelation(property, {
      type: 'ManyToMany',
      model: Model,
      foreignKey: options?.columnName || `${Model.name.toLowerCase()}_id`,
    })
  }
}
