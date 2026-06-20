export * from './auth.schema';

export const generateSchema = (collections: any[]) => {
  console.log(`[Schema] Generating SQL schema for ${collections.length} collections`);
  return 'CREATE TABLE ...';
};
