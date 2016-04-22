import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const postTypeSchema = new Schema('postTypes');

postTypeSchema.define({

});

export default function normalisePostType (postType) {
  return normalize(humps.camelizeKeys(postType), postTypeSchema);
};

export function normalisePostType (postTypes) {
  return normalize(humps.camelizeKeys(postTypes), arrayOf(postTypeSchema));
}
