import { Serializer } from './base';
import { Field } from './fields/base';
import { CharField, IntegerField, FloatField, BooleanField } from './fields/core';

interface ModelField {
  type: string;
  required: boolean;
  default?: any;
}

interface Model {
  getFields(): Record<string, ModelField>;
  create(data: Record<string, any>): Promise<any>;
  update(instance: any, data: Record<string, any>): Promise<any>;
}

const fieldMapping: Record<string, typeof Field> = {
  'string': CharField,
  'number': IntegerField,
  'float': FloatField,
  'boolean': BooleanField,
};

export class ModelSerializer extends Serializer {
  static model?: Model;

  constructor(instance?: any, options = {}) {
    super(instance, options);
    this.bindModelFields();
  }

  protected bindModelFields() {
    const model = (this.constructor as typeof ModelSerializer).model;
    if (!model) return;

    const modelFields = model.getFields();
    for (const [name, field] of Object.entries(modelFields)) {
      if (this.fields.has(name)) continue; // Don't override explicitly declared fields
      if (!this.shouldIncludeField(name)) continue;

      const FieldClass = fieldMapping[field.type] || CharField;
      const fieldInstance = new FieldClass({
        required: field.required,
        default: field.default,
      });

      this.fields.set(name, fieldInstance);
      fieldInstance.bind(name, this);
    }
  }

  async create(validated: Record<string, any>): Promise<any> {
    const model = (this.constructor as typeof ModelSerializer).model;
    if (!model) {
      throw new Error('model must be defined');
    }

    return model.create(validated);
  }

  async update(instance: any, validated: Record<string, any>): Promise<any> {
    const model = (this.constructor as typeof ModelSerializer).model;
    if (!model) {
      throw new Error('model must be defined');
    }

    return model.update(instance, validated);
  }

  async partialUpdate(instance: any, data: Record<string, any>): Promise<any> {
    // For partial updates, make all fields optional
    for (const field of this.fields.values()) {
      field.required = false;
    }

    const validated = await this.validate(data);
    return this.update(instance, validated);
  }
}
