import { SchemaField } from './types';

export class SchemaFieldBuilder {
  private field: SchemaField;

  constructor(type: SchemaField['type']) {
    this.field = { type };
  }

  required(isRequired: boolean = true): this {
    this.field.required = isRequired;
    return this;
  }

  min(value: number): this {
    this.field.min = value;
    return this;
  }

  max(value: number): this {
    this.field.max = value;
    return this;
  }

  match(pattern: RegExp): this {
    this.field.match = pattern;
    return this;
  }

  enum(values: any[]): this {
    this.field.enum = values;
    return this;
  }

  lowercase(value: boolean = true): this {
    if (this.field.type === String) {
      this.field.lowercase = value;
    }
    return this;
  }

  uppercase(value: boolean = true): this {
    if (this.field.type === String) {
      this.field.uppercase = value;
    }
    return this;
  }

  trim(value: boolean = true): this {
    if (this.field.type === String) {
      this.field.trim = value;
    }
    return this;
  }

  default(value: any): this {
    this.field.default = value;
    return this;
  }

  index(value: boolean = true): this {
    this.field.index = value;
    return this;
  }

  unique(value: boolean = true): this {
    this.field.unique = value;
    return this;
  }

  sparse(value: boolean = true): this {
    this.field.sparse = value;
    return this;
  }

  immutable(value: boolean = true): this {
    this.field.immutable = value;
    return this;
  }

  items(schema: SchemaField): this {
    if (this.field.type === Array) {
      this.field.items = schema;
    }
    return this;
  }

  schema(schema: SchemaField['schema']): this {
    if (this.field.type === Object) {
      this.field.schema = schema;
    }
    return this;
  }

  number(): this {
    this.field.type = Number;
    return this;
  }

  build(): SchemaField {
    return { ...this.field };
  }
}
