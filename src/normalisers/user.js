import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const userSchema = new Schema('users');

export default function normaliseUser (user) {
  const schema = Array.isArray(user) ? arrayOf(userSchema) : userSchema;
  return normalize(humps.camelizeKeys(user), schema);
};
