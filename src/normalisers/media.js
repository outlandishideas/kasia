import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

export const mediaSchema = new Schema('media');

mediaSchema.define({

});

export default function normaliseMedia (media) {
  return normalize(humps.camelizeKeys(media), mediaSchema);
};

export function normaliseMedias (medias) {
  return normalize(humps.camelizeKeys(medias), arrayOf(mediaSchema));
}
