import merge from 'lodash.merge'
import mapKeys from 'lodash.mapkeys'

const effects = [
  // Rename keys under `links` in order that normalizr doesn't treat them as entities
  // e.g. `links.author` -> `links.links:author`
  function renameLinksProps (original, flattened) {
    if (original && typeof original.links !== 'undefined') {
      flattened.links = mapKeys(original.links, (_, key) => `links:${key}`)
    }
    return flattened
  },

  function flattenRenderedProps (original, flattened) {
    // TODO check that rendered is the only key in object before flattening
    Object.keys(original).forEach((key) => {
      if (original[key] && original[key].rendered) {
        flattened[key] = original[key].rendered
      }
    })
    return flattened
  },

  function liftEmbeddedAuthor (original, flattened) {
    if (original.author && typeof original.embedded !== 'undefined') {
      flattened.author = original.embedded.author
        .find((author) => author.id === original.author)
    }
    return flattened
  },

  function liftEmbeddedFeaturedMedia (original, flattened) {
    const hasFeaturedMedia = typeof original.featuredMedia !== 'undefined'

    const hasEmbeddedFeaturedMedia = typeof original.embedded !== 'undefined' &&
      typeof original.embedded['wp:featuredmedia'] !== 'undefined'

    if (hasEmbeddedFeaturedMedia) {
      flattened.embedded['wp:featuredmedia'] = flatten(original.embedded['wp:featuredmedia'])

      if (hasFeaturedMedia) {
        flattened.featuredMedia = flattened.embedded['wp:featuredmedia']
          .find((media) => media.id === original.featuredMedia)
      }
    }

    return flattened
  }
]

export default function flatten (obj) {
  if (Array.isArray(obj)) {
    return obj.map(flatten)
  }

  return effects
    .reduce((flattened, effect) => {
      return effect(obj, flattened)
    }, merge({}, obj))
}
