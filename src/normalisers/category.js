import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const categorySchema = new Schema('categories');

categorySchema.define({

});

export default function normaliseCategory (category) {
  return normalize(humps.camelizeKeys(category), categorySchema);
};

export function normaliseCategories (categories) {
  return normalize(humps.camelizeKeys(categories), arrayOf(categorySchema));
}
