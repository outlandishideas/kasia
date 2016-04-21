import { normalize, Schema, arrayOf } from 'normalizr';

export const revisionSchema = new Schema('revisions');

revisionSchema.define({

});

export default function normaliseRevision (obj) {
  return normalize(obj, revisionSchema);
};
