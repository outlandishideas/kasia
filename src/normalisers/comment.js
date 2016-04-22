import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const commentSchema = new Schema('comments');

commentSchema.define({

});

export default function normaliseComment (comment) {
  return normalize(humps.camelizeKeys(comment), commentSchema);
};

export function normaliseComments (comments) {
  return normalize(humps.camelizeKeys(comments), arrayOf(commentSchema));
}
