import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const pageSchema = new Schema('pages');

export default function normalisePage (page) {
  const schema = Array.isArray(page) ? arrayOf(pageSchema) : pageSchema;
  return normalize(humps.camelizeKeys(page), schema);
};
