import { type Output, type BaseSchema, type SafeParseError } from 'valibot';
import type { Serializer } from '../base';

export interface FieldOptions {
  required?: boolean;
  default?: any;
  allowNull?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  source?: string;
  validators?: ((value: any) => void)[];
}

export class Field {
  name?: string;
  source?: string;
  required: boolean;
  default: any;
  allowNull: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  validators: ((value: any) => void)[];
  schema?: BaseSchema

  constructor(options: FieldOptions = {}) {
    this.required = options.required ?? true;
    this.default = options.default;
    this.allowNull = options.allowNull ?? false;
    this.readOnly = options.readOnly ?? false;
    this.writeOnly = options.writeOnly ?? false;
    this.source = options.source;
    this.validators = options.validators ?? [];
  }

  bind(name: string, serializer: Serializer) {
    this.name = name;
    if (!this.source) {
      this.source = name;
    }
  }

  getValue(instance: any): any {
    if (!this.source) return undefined;

    if (typeof instance[this.source] === 'function') {
      return instance[this.source]();
    }

    return instance[this.source];
  }

  validate(value: any): void {
    if (value === undefined) {
      if (this.required) {
        throw new Error(`${this.name} is required`);
      }
      return;
    }

    if (value === null && !this.allowNull) {
      throw new Error(`${this.name} cannot be null`);
    }

    if (this.schema) {
      const result = this.schema.safeParse(value);
      if (!result.success) {
        const error = result as SafeParseError<any>;
        throw new Error(error.error.message);
      }
    }

    for (const validator of this.validators) {
      validator(value);
    }
  }

  serialize(value: any): any {
    return value;
  }

  deserialize(value: any): any {
    return value;
  }
}
