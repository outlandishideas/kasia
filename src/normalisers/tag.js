import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const tagSchema = new Schema('tags');

tagSchema.define({

});

export default function normaliseTag (tag) {
  return normalize(humps.camelizeKeys(tag), tagSchema);
};

export function normaliseTags (tags) {
  return normalize(humps.camelizeKeys(tags), arrayOf(tagSchema));
}
