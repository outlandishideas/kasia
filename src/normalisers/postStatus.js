import { normalize, Schema, arrayOf } from 'normalizr';

export const postStatusSchema = new Schema('postStatuses');

postStatusSchema.define({

});

export default function normaliseStatus (obj) {
  return normalize(obj, postStatusSchema);
};
