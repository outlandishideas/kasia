import { normalize, Schema, arrayOf } from 'normalizr';

export const mediaSchema = new Schema('media');

mediaSchema.define({

});

export default function normaliseMedia (obj) {
  return normalize(obj, mediaSchema);
};
