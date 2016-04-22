import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const postStatusSchema = new Schema('postStatuses');

postStatusSchema.define({

});

export default function normaliseStatus (status) {
  return normalize(humps.camelizeKeys(status), postStatusSchema);
};

export function normaliseStatuses (statuses) {
  return normalize(humps.camelizeKeys(statuses), arrayOf(postStatusSchema));
}
