import { normalize, Schema, arrayOf } from 'normalizr';

export const taxonomySchema = new Schema('taxonomies');

taxonomySchema.define({

});

export default function normaliseTaxonomy (obj) {
  return normalize(obj, taxonomySchema);
};
