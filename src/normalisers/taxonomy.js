import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const taxonomySchema = new Schema('taxonomies');

taxonomySchema.define({

});

export default function normaliseTaxonomy (taxonomy) {
  return normalize(humps.camelizeKeys(taxonomy), taxonomySchema);
};

export function normaliseTaxonomies (taxonomies) {
  return normalize(humps.camelizeKeys(taxonomies), arrayOf(taxonomySchema));
}
