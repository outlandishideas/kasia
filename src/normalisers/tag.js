import { normalize, Schema, arrayOf } from 'normalizr';

export const tagSchema = new Schema('tags');

tagSchema.define({

});

export default function normaliseTag (obj) {
  return normalize(obj, tagSchema);
};
