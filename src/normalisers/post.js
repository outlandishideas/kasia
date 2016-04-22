import { normalize, Schema, arrayOf } from 'normalizr';
import humps from 'humps';

import { userSchema } from './user';
import { mediaSchema } from './media';
import { categorySchema } from './category';
import { tagSchema } from './tag';

export const postSchema = new Schema('posts');

postSchema.define({
  author: userSchema,
  featuredMedia: mediaSchema,
  categories: arrayOf(categorySchema),
  tags: arrayOf(tagSchema)
});

function flattenPost (post) {
  const flattened = Object.assign({}, post);

  const hasLinks = typeof post.links !== 'undefined';
  const hasEmbeddedContent = typeof post.embedded !== 'undefined';
  const hasEmbeddedFeaturedMedia = typeof post.embedded['wp:featuredmedia'] !== 'undefined';

  flattened.guid = post.guid.rendered;
  flattened.title = post.title.rendered;
  flattened.content = post.content.rendered;
  flattened.excerpt = post.excerpt.rendered;

  if (hasLinks) {
    flattened.links = Object.keys(post.links)
      .reduce((links, key) => {
        links[`links:${key}`] = post.links[key];
        return links;
      }, {});
  }

  if (hasEmbeddedContent) {
    flattened.author = post.embedded.author
      .find(author => author.id === post.author);
  }

  if (hasEmbeddedContent && hasEmbeddedFeaturedMedia) {
    flattened.featuredMedia = post.embedded['wp:featuredmedia']
      .find(media => media.id === post.featuredMedia);
  }

  return flattened;
}

export default function normalisePost (post) {
  return normalize(flattenPost(humps.camelizeKeys(post)), postSchema);
};

export function normalisePosts (posts) {
  return normalize(flattenPost(humps.camelizeKeys(posts)), arrayOf(postSchema));
}
