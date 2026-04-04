import { z } from 'zod';

export const defineSchema = (schema: z.ZodRawShape) => {
  return z.object(schema);
};

export const FieldTypes = {
  string: () => z.string(),
  text: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  date: () => z.date(),
  portableText: () => z.array(z.any()), // Simplified for demo
  relation: (collection: string) => z.string().uuid()
};
