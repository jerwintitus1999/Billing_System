export type ValidationSource = 'body' | 'query' | 'params';

export interface ValidationSchema {
  [key: string]: SchemaField;
}

export interface SchemaField {
  type: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor | ArrayConstructor | ObjectConstructor;
  required?: boolean;
  min?: number;
  max?: number;
  match?: RegExp;
  enum?: any[];
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  items?: SchemaField;
  schema?: ValidationSchema;
  default?: any;
  index?: boolean;
  unique?: boolean;
  sparse?: boolean;
  immutable?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  source: ValidationSource;
}

export type RequestValidationSchema = {
  [key in ValidationSource]?: ValidationSchema;
};