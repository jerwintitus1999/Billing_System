import Joi from 'joi';
import { ValidationSchema, SchemaField } from './types';

const joiSchemaCache = new Map<string, Joi.ObjectSchema>();

export function buildJoiSchema(schema: ValidationSchema, isUpdate: boolean = false): Joi.ObjectSchema {
  const cacheKey = `${JSON.stringify(schema)}_${isUpdate}`;
  
  if (joiSchemaCache.has(cacheKey)) {
    return joiSchemaCache.get(cacheKey)!;
  }

  const joiSchema = Joi.object(
    Object.entries(schema).reduce((acc, [key, field]) => {
      acc[key] = buildJoiField(field, isUpdate);
      return acc;
    }, {} as Record<string, Joi.AnySchema>)
  ).options({ abortEarly: false });

  joiSchemaCache.set(cacheKey, joiSchema);
  return joiSchema;
}

function buildJoiField(field: SchemaField, isUpdate: boolean): Joi.AnySchema {
  let schema: Joi.AnySchema;

  switch (field.type) {
    case String: {
      let stringSchema = Joi.string();
      if (field.lowercase) stringSchema = stringSchema.lowercase();
      if (field.trim) stringSchema = stringSchema.trim();
      if (field.min) stringSchema = stringSchema.min(field.min);
      if (field.max) stringSchema = stringSchema.max(field.max);
      if (field.match) stringSchema = stringSchema.pattern(field.match);
      if (field.enum) stringSchema = stringSchema.valid(...field.enum);
      schema = stringSchema;
      break;
    }

    case Number: {
      let numberSchema = Joi.number();
      if (field.min) numberSchema = numberSchema.min(field.min);
      if (field.max) numberSchema = numberSchema.max(field.max);
      if (field.enum) numberSchema = numberSchema.valid(...field.enum);
      schema = numberSchema;
      break;
    }

    case Boolean: {
      schema = Joi.boolean();
      break;
    }

    case Date: {
      let dateSchema = Joi.date();
      if (field.min) dateSchema = dateSchema.min(new Date(field.min));
      if (field.max) dateSchema = dateSchema.max(new Date(field.max));
      schema = dateSchema;
      break;
    }

    case Array: {
      let arraySchema = Joi.array();
      if (field.items) arraySchema = arraySchema.items(buildJoiField(field.items, isUpdate));
      schema = arraySchema;
      break;
    }

    case Object: {
      schema = field.schema ? buildJoiSchema(field.schema, isUpdate) : Joi.object();
      break;
    }

    default:
      throw new Error(`Unsupported type for field`);
  }

  if (field.required && !isUpdate) {
    schema = schema.required();
  }

  if (field.default !== undefined) {
    schema = schema.default(field.default);
  }

  return schema;
}