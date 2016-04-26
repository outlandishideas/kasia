import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const revisionSchema = new Schema('revisions');

export default function normaliseRevision (revision) {
  const schema = Array.isArray(revision) ? arrayOf(revisionSchema) : revisionSchema;
  return normalize(humps.camelizeKeys(revision), schema);
};
