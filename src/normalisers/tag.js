import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const tagSchema = new Schema('tags');

export default function normaliseTag (tag) {
  return normalize(humps.camelizeKeys(tag), tagSchema);
};

export function normaliseTags (tags) {
  const schema = Array.isArray(tags) ? arrayOf(tagSchema) : tagSchema;
  return normalize(humps.camelizeKeys(tags), arrayOf(schema));
}
