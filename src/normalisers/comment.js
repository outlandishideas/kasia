import { normalize, Schema, arrayOf } from 'normalizr';

export const commentSchema = new Schema('comments');

commentSchema.define({

});

export default function normaliseComment (obj) {
  return normalize(obj, commentSchema);
};
