import { normalize, Schema, arrayOf } from 'normalizr';

import user from './user';
import media from './media';
import category from './category';
import tag from './tag';

export const postSchema = new Schema('posts');

postSchema.define({
  author: user,
  featured_media: media,
  categories: arrayOf(category),
  tags: arrayOf(tag)
});

export default function normalisePost (obj) {
  return normalize(obj, postSchema);
};
