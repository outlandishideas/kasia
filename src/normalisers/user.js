import { normalize, Schema, arrayOf } from 'normalizr';

export const userSchema = new Schema('users');

userSchema.define({

});

export default function normaliseUser (obj) {
  return normalize(obj, userSchema);
};
