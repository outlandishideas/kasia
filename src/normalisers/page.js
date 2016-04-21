import { normalize, Schema, arrayOf } from 'normalizr';

export const pageSchema = new Schema('pages');

pageSchema.define({

});

export default function normalisePage (obj) {
  return normalize(obj, pageSchema);
};
