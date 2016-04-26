import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const postStatusSchema = new Schema('postStatuses');

export default function normaliseStatus (status) {
  const schema = Array.isArray(status) ? arrayOf(postStatusSchema) : postStatusSchema;
  return normalize(humps.camelizeKeys(status), schema);
};
