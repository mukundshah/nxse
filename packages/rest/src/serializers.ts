type FieldOptions = {
  initial?: any;
  validators?: any[];
  error_messages?: any;
  help_text?: any;
  allow_null?: boolean;
} & (
  {
    write_only?: boolean;
    required?: boolean;
  } | {
    read_only?: boolean;
  } | {
    write_only?: boolean;
    default?: any;
  }
)

export class Field {

  default_error_messages = {
    required: 'This field is required.',
    null: 'This field may not be null.'
  }

  constructor({error_messages}: FieldOptions = {}){
    this.default_error_messages = {
      ...this.default_error_messages,
      ...error_messages
    }
  }

}

export class Serializer {
  get data() {
    return {};
  }

  get errors() {
    return {};
  }

  is_valid(throw_error: boolean): boolean {
    return true;
  }

  create(validated_data): void {
  }

  update(instance, validated_data): void {
  }

  save(): void {
  }
}

export class ModelSerializer extends Serializer {
  static config = {
    model: null,
    fields: [],
    exclude: [],
    read_only_fields: [],
    write_only_fields: [],
    required_fields: [],
    validators: [],
    error_messages: {},
    help_texts: {},
    label: {},
  };
}
