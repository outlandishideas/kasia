import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const categorySchema = new Schema('categories');

export default function normaliseCategory (category) {
  const schema = Array.isArray(category) ? arrayOf(categorySchema) : categorySchema;
  return normalize(humps.camelizeKeys(category), schema);
};
