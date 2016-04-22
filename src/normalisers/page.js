import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const pageSchema = new Schema('pages');

pageSchema.define({

});

export default function normalisePage (page) {
  return normalize(humps.camelizeKeys(page), pageSchema);
};

export function normalisePages (pages) {
  return normalize(humps.camelizeKeys(pages), arrayOf(pageSchema));
}
