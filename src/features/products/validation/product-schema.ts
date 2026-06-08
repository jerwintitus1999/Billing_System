import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long"),
  price: z.number().min(0, "Price must be a positive number"),
  date: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;