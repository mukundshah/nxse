import type { Field } from './fields/base';

export interface SerializerOptions {
  include?: string[];
  exclude?: string[];
  depth?: number;
  readOnlyFields?: string[];
  writeOnlyFields?: string[];
}

export interface SerializerConstructor {
  new (instance?: any, options?: SerializerOptions): Serializer;
  prototype: Serializer;
}

export class Serializer {
  static include?: string[];
  static exclude?: string[];
  static depth?: number;
  static readOnlyFields?: string[];
  static writeOnlyFields?: string[];

  protected instance: any;
  protected options: SerializerOptions;
  protected fields: Map<string, Field> = new Map();
  protected errors: Map<string, string[]> = new Map();

  constructor(instance?: any, options: SerializerOptions = {}) {
    this.instance = instance;
    this.options = {
      include: options.include ?? this.constructor.include,
      exclude: options.exclude ?? this.constructor.exclude,
      depth: options.depth ?? this.constructor.depth,
      readOnlyFields: options.readOnlyFields ?? this.constructor.readOnlyFields,
      writeOnlyFields: options.writeOnlyFields ?? this.constructor.writeOnlyFields,
    };
    this.bindFields();
  }

  protected bindFields() {
    // Get all properties from the instance that are Field instances
    for (const [name, value] of Object.entries(Object.getPrototypeOf(this))) {
      if (value instanceof Field) {
        this.fields.set(name, value);
        value.bind(name, this);
      }
    }
  }

  protected shouldIncludeField(name: string): boolean {
    if (this.options.exclude?.includes(name)) return false;
    if (this.options.include?.length && !this.options.include.includes(name)) return false;
    return true;
  }

  get data(): any {
    const result: Record<string, any> = {};

    for (const [name, field] of this.fields) {
      if (!this.shouldIncludeField(name)) continue;
      if (field.writeOnly) continue;

      try {
        const value = field.getValue(this.instance);
        if (value !== undefined) {
          result[name] = field.toRepresentation(value);
        }
      } catch (error) {
        this.errors.set(name, [error.message]);
      }
    }

    return result;
  }

  async validate(data: Record<string, any>): Promise<Record<string, any>> {
    const errors = new Map<string, string[]>();
    const validated: Record<string, any> = {};

    // Field-level validation
    for (const [name, field] of this.fields) {
      if (!this.shouldIncludeField(name)) continue;
      if (field.readOnly) continue;

      try {
        const value = data[name];
        field.validate(value);
        if (value !== undefined) {
          validated[name] = field.toInternal(value);
        }
      } catch (error) {
        errors.set(name, [error.message]);
      }
    }

    // Run validate_<field_name> methods
    for (const [name, value] of Object.entries(validated)) {
      const methodName = `validate_${name}`;
      if (typeof this[methodName] === 'function') {
        try {
          validated[name] = await this[methodName](value);
        } catch (error) {
          errors.set(name, [...(errors.get(name) || []), error.message]);
        }
      }
    }

    // Run validate method for cross-field validation
    try {
      await this.validate(validated);
    } catch (error) {
      errors.set('non_field_errors', [error.message]);
    }

    if (errors.size > 0) {
      throw new ValidationError(errors);
    }

    return validated;
  }

  async create(validated: Record<string, any>): Promise<any> {
    throw new Error('create() must be implemented');
  }

  async update(instance: any, validated: Record<string, any>): Promise<any> {
    throw new Error('update() must be implemented');
  }

  async save(data: Record<string, any>): Promise<any> {
    const validated = await this.validate(data);
    
    if (this.instance) {
      return this.update(this.instance, validated);
    }
    
    return this.create(validated);
  }
}

export class ValidationError extends Error {
  constructor(public errors: Map<string, string[]>) {
    super('Validation Error');
    this.name = 'ValidationError';
  }
}
