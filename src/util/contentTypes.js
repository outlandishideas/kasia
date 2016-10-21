import wpFilterMixins from 'wpapi/lib/mixins/filters'
import wpParamMixins from 'wpapi/lib/mixins/parameters'
import merge from 'lodash.merge'
import { camelize } from 'humps'

import { ContentTypes, ContentTypesPlural } from '../constants/ContentTypes'
import invariants from './invariants'

const contentTypes = {}

export default contentTypes

// Pre-populate cache with built-in content type options
const optionsCache = Object.keys(ContentTypes).reduce((cache, key) => {
  const name = ContentTypes[key]

  cache[name] = {
    name,
    plural: ContentTypesPlural[name],
    slug: ContentTypesPlural[name]
  }

  return cache
}, {})

/**
 * Create and set the options object for a content type in the cache
 * and create the method on an instance of wpapi.
 * @param {Object} WP Instance of wpapi
 * @param {Object} contentType Content type options object
 * @returns {Object}
 */
contentTypes.regiser = function contentTypes_register (WP, contentType) {
  invariants.isValidContentTypeObject(contentType)
  invariants.isNewContentType(getContentTypes(), contentType)

  const {
    namespace = 'wp/v2',
    name, methodName, plural, route, slug
  } = contentType

  const realRoute = route || `/${slug}/(?P<id>)`
  const realMethodName = camelize(methodName || plural)
  const mixins = merge({}, wpFilterMixins, wpParamMixins)

  optionsCache[name] = contentType
  WP[realMethodName] = WP.registerRoute(namespace, realRoute, { mixins })
}

/**
 * Get the options for a content type.
 * @param {String} contentType The name of the content type
 * @returns {Object}
 */
contentTypes.get = function contentTypes_get (contentType) {
  return optionsCache[contentType]
}

/**
 * Get all registered content types and their options.
 * @returns {Object}
 */
contentTypes.getAll = function contentTypes_getAll () {
  return optionsCache
}

/**
 * Derive the content type of an entity from the WP-API.
 * Accepts normalised (camel-case keys) or non-normalised data.
 * @param {Object} entity
 * @returns {String} The content type
 */
contentTypes.derive = function contentTypes_derive (entity) {
  if (typeof entity.type !== 'undefined') {
    if (entity.type === 'comment') {
      return ContentTypes.Comment
    } else if (entity.type === 'attachment') {
      return ContentTypes.Media
    } else if (entity.type === 'page') {
      return ContentTypes.Page
    } else if (entity.type === 'post') {
      return ContentTypes.Post
    } else {
      // Custom content type
      return entity.type
    }
  }

  if (
    typeof entity.public !== 'undefined' &&
    typeof entity.queryable !== 'undefined' &&
    typeof entity.slug !== 'undefined'
  ) {
    return ContentTypes.PostStatus
  }

  if (typeof entity.taxonomy !== 'undefined') {
    if (entity.taxonomy === 'category') {
      return ContentTypes.Category
    } else if (entity.taxonomy === 'post_tag') {
      return ContentTypes.Tag
    }
  }

  if (entity.types instanceof Array) {
    return ContentTypes.Taxonomy
  }

  if (
    typeof entity.description !== 'undefined' &&
    typeof entity.hierarchical !== 'undefined' &&
    typeof entity.name !== 'undefined'
  ) {
    return ContentTypes.PostType
  }

  if (
    typeof entity.avatar_urls !== 'undefined' ||
    typeof entity.avatarUrls !== 'undefined'
  ) {
    return ContentTypes.User
  }
}
