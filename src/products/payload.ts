import { SchemaFieldBuilder } from "../validation/schemaField";

export interface CreateProductsPayload {
  name: string;
  price: number;
}

export const Validation = {
  body: {
    name: new SchemaFieldBuilder(String).required().min(2).build(),
    price: new SchemaFieldBuilder(Number).required().min(0).build(),
    date: new SchemaFieldBuilder(Date).build(),
  },
  update: {
    name: new SchemaFieldBuilder(String).min(2).build(),
    price: new SchemaFieldBuilder(Number).min(0).build(),
    date: new SchemaFieldBuilder(Date).build(),
  },
  queryId: {
    id: new SchemaFieldBuilder(String).required().build(),
  },
};