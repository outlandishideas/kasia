import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const mediaSchema = new Schema('media');

export default function normaliseMedia (media) {
  const schema = Array.isArray(media) ? arrayOf(mediaSchema) : mediaSchema;
  return normalize(humps.camelizeKeys(media), schema);
};
