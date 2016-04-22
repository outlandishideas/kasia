import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const userSchema = new Schema('users');

export default function normaliseUser (user) {
  return normalize(humps.camelizeKeys(user), userSchema);
};

export function normaliseUsers (users) {
  return normalize(humps.camelizeKeys(users), arrayOf(userSchema));
}
