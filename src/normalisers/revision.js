import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const revisionSchema = new Schema('revisions');

revisionSchema.define({

});

export default function normaliseRevision (revision) {
  return normalize(humps.camelizeKeys(revision), revisionSchema);
};

export function normaliseRevisions (revisions) {
  return normalize(humps.camelizeKeys(revisions), arrayOf(revisionSchema));
}
