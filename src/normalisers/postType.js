import { normalize, Schema, arrayOf } from 'normalizr';

export const postTypeSchema = new Schema('postTypes');

postTypeSchema.define({

});

export default function normalisePostType (obj) {
  return normalize(obj, postTypeSchema);
};
