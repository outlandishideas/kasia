import merge from 'lodash.merge';

// Properties on content that tend to just have a single key `rendered`
const renderedProps = [
  'guid',
  'title',
  'content',
  'excerpt'
];

// Rename keys under `links` in order that normalizr doesn't
// treat them as entities, e.g. `links.author` -> `links.links:author`
function renameLinksProps (original, flattened) {
  if (typeof original.links !== 'undefined') {
    flattened.links = Object.keys(original.links)
      .reduce((links, key) => {
        links[`links:${key}`] = original.links[key];
        return links;
      }, {});
  }
}

function flattenRenderedProps (original, flattened) {
  renderedProps.forEach(key => {
    if (original[key] && original[key].rendered) {
      flattened[key] = original[key].rendered;
    }
  });
}

function fllattemAuthor (original, flattened) {
  if (original.author && typeof original.embedded !== 'undefined') {
    flattened.author = original.embedded.author
      .find(author => author.id === original.author);
  }
}

function flattenFeaturedMedia (original, flattened) {
  const hasFeaturedMedia = typeof original.featuredMedia !== 'undefined';

  const hasEmbeddedFeaturedMedia = typeof original.embedded !== 'undefined'
    && typeof original.embedded['wp:featuredmedia'] !== 'undefined';

  if (hasEmbeddedFeaturedMedia) {
    flattened.embedded['wp:featuredmedia'] = flatten(original.embedded['wp:featuredmedia']);

    if (hasFeaturedMedia) {
      flattened.featuredMedia = flattened.embedded['wp:featuredmedia']
        .find(media => media.id === original.featuredMedia);
    }
  }
}

export default function flatten (obj) {
  if (Array.isArray(obj)) {
    return obj.map(flatten);
  }

  const flattened = merge({}, obj);

  renameLinksProps(obj, flattened);
  flattenRenderedProps(obj, flattened);
  fllattemAuthor(obj, flattened);
  flattenFeaturedMedia(obj, flattened);

  return flattened;
};
