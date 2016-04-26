import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const commentSchema = new Schema('comments');

export default function normaliseComment (comment) {
  const schema = Array.isArray(comment) ? arrayOf(commentSchema) : commentSchema;
  return normalize(humps.camelizeKeys(comment), schema);
};
