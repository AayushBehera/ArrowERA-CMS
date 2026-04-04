import { cms } from '../core';

export async function getEmDashCollection(collectionName: string) {
  return cms.getCollection(collectionName);
}
