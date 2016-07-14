import humps from 'humps'

import { Slugs } from './constants/WpApiEndpoints'
import ContentTypes from './constants/ContentTypes'
import Plurality from './constants/Plurality'
import invariants from './invariants'

const pluralise = (str) => str[str.length - 1] === 's' ? str : str + 's'

/**
 * Produce an options object for a (custom) content type.
 * @param {String|Object} options Name of content type or options object
 * @returns {Object}
 */
export function makeContentTypeOptions (options) {
  invariants.badCustomContentTypeName(options)

  options = typeof options === 'string'
    ? { name: String(options) }
    : options

  const isCustomContentType = !ContentTypes[nameCanonical]
  const nameCanonical = options.name
  const nameSingle = options.nameSingle || nameCanonical
  const namePlural = options.namePlural || pluralise(nameCanonical)

  let slug = {}
  let name = {}

  if (isCustomContentType) {
    const requestSlug = options.requestSlug || humps.decamelize(namePlural, { separator: '-' })

    slug[Plurality.SINGULAR] = `/${requestSlug}/:id`
    slug[Plurality.PLURAL] = `/${requestSlug}`

    // Canonical name is used when querying content types
    name.canonical = options.name
    // Singular is used for placing an item on a component's props, e.g. `this.props.postType`
    name[Plurality.SINGULAR] = humps.camelize(nameSingle)
    // Plural is used for entity collection name in the store, e.g. `store.wordpress.entities.postTypes`
    name[Plurality.PLURAL] = humps.camelize(namePlural)
  } else {
    slug = Slugs[nameCanonical]
    name = {
      [Plurality.SINGULAR]: mapToCamelCaseSingular(ContentTypes[nameCanonical]),
      [Plurality.PLURAL]: mapToCamelCasePlural(ContentTypes[nameCanonical])
    }
  }

  return { isCustomContentType, slug, name }
}

function mapToCamelCaseSingular (contentType) {
  return {
    [ContentTypes.CATEGORY]: 'category',
    [ContentTypes.COMMENT]: 'comment',
    [ContentTypes.MEDIA]: 'media',
    [ContentTypes.PAGE]: 'page',
    [ContentTypes.POST]: 'post',
    [ContentTypes.POST_REVISION]: 'postRevision',
    [ContentTypes.POST_TYPE]: 'postType',
    [ContentTypes.POST_STATUS]: 'postStatus',
    [ContentTypes.TAG]: 'tag',
    [ContentTypes.TAXONOMY]: 'taxonomy',
    [ContentTypes.USER]: 'user'
  }[contentType]
}

function mapToCamelCasePlural (contentType) {
  return {
    [ContentTypes.CATEGORY]: 'categories',
    [ContentTypes.COMMENT]: 'comments',
    [ContentTypes.MEDIA]: 'media',
    [ContentTypes.PAGE]: 'pages',
    [ContentTypes.POST]: 'posts',
    [ContentTypes.POST_REVISION]: 'postRevisions',
    [ContentTypes.POST_TYPE]: 'postTypes',
    [ContentTypes.POST_STATUS]: 'postStatuses',
    [ContentTypes.TAG]: 'tags',
    [ContentTypes.TAXONOMY]: 'taxonomies',
    [ContentTypes.USER]: 'users'
  }[contentType]
}
