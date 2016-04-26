import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const taxonomySchema = new Schema('taxonomies');

export default function normaliseTaxonomy (taxonomy) {
  const schema = Array.isArray(taxonomy) ? arrayOf(taxonomySchema) : taxonomySchema;
  return normalize(humps.camelizeKeys(taxonomy), schema);
};
