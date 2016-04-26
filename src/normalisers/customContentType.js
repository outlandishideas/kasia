import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const customContentTypeSchema = new Schema('posts');

export default function normaliseCustomContentType (customContent) {
  const schema = Array.isArray(customContent) ? arrayOf(customContentTypeSchema) : customContentTypeSchema;
  return normalize(humps.camelizeKeys(customContent), schema);
};
