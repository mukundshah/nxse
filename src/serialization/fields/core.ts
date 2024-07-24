import { string, number, boolean, type BaseSchema, type Output } from 'valibot';
import { Field, type FieldOptions } from './base';

interface TypedFieldOptions extends FieldOptions {
  schema?: BaseSchema;
}

export class CharField extends Field {
  constructor(options: TypedFieldOptions = {}) {
    super(options);
    this.schema = options.schema ?? string();
  }

  toRepresentation(value: any): string | null {
    if (value === null && this.allowNull) return null;
    return String(value);
  }
}

export class IntegerField extends Field {
  constructor(options: TypedFieldOptions = {}) {
    super(options);
    this.schema = options.schema ?? number();
  }

  toRepresentation(value: any): number | null {
    if (value === null && this.allowNull) return null;
    return Number(value);
  }

  toInternal(value: any): number | null {
    if (value === null && this.allowNull) return null;
    const num = Number(value);
    return Math.floor(num);
  }
}

export class FloatField extends Field {
  constructor(options: TypedFieldOptions = {}) {
    super(options);
    this.schema = options.schema ?? number();
  }

  toRepresentation(value: any): number | null {
    if (value === null && this.allowNull) return null;
    return Number(value);
  }

  toInternal(value: any): number | null {
    if (value === null && this.allowNull) return null;
    return Number(value);
  }
}

export class BooleanField extends Field {
  constructor(options: TypedFieldOptions = {}) {
    super(options);
    this.schema = options.schema ?? boolean();
  }

  toRepresentation(value: any): boolean | null {
    if (value === null && this.allowNull) return null;
    return Boolean(value);
  }

  toInternal(value: any): boolean | null {
    if (value === null && this.allowNull) return null;
    return Boolean(value);
  }
}

export class SerializerMethodField extends Field {
  methodName?: string;

  constructor(options: FieldOptions = {}) {
    super({ ...options, readOnly: true });
  }

  bind(name: string, serializer: any) {
    super.bind(name, serializer);
    this.methodName = this.source || `get_${name}`;
  }

  getValue(instance: any): any {
    if (!this.methodName) return undefined;
    const method = this.parent[this.methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${this.methodName} not found on serializer`);
    }
    return method.call(this.parent, instance);
  }
}

interface RelatedFieldOptions extends FieldOptions {
  serializer: typeof Field;
  many?: boolean;
}

export class RelatedField extends Field {
  serializer: typeof Field;
  many: boolean;

  constructor(options: RelatedFieldOptions) {
    super(options);
    this.serializer = options.serializer;
    this.many = options.many ?? false;
  }

  toRepresentation(value: any): any {
    if (value === null && this.allowNull) return null;
    
    if (this.many) {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array for ${this.name}`);
      }
      return value.map(item => new this.serializer().toRepresentation(item));
    }
    
    return new this.serializer().toRepresentation(value);
  }

  toInternal(value: any): any {
    if (value === null && this.allowNull) return null;

    if (this.many) {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array for ${this.name}`);
      }
      return value.map(item => new this.serializer().toInternal(item));
    }

    return new this.serializer().toInternal(value);
  }
}

export class ForeignKeyField extends RelatedField {
  constructor(options: RelatedFieldOptions) {
    super({ ...options, many: false });
  }
}

export class ManyToManyField extends RelatedField {
  constructor(options: RelatedFieldOptions) {
    super({ ...options, many: true });
  }
}

export class OneToOneField extends RelatedField {
  constructor(options: RelatedFieldOptions) {
    super({ ...options, many: false });
  }
}
