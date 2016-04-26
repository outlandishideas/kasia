import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const postTypeSchema = new Schema('postTypes');

export default function normalisePostType (postType) {
  const schema = Array.isArray(postType) ? arrayOf(postTypeSchema) : postTypeSchema;
  return normalize(humps.camelizeKeys(postType), schema);
};
