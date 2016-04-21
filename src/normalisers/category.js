import { normalize, Schema, arrayOf } from 'normalizr';

export const categorySchema = new Schema('categories');

categorySchema.define({

});

export default function normaliseCategory (obj) {
  return normalize(obj, categorySchema);
};
