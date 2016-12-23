import wpFilterMixins from 'wpapi/lib/mixins/filters'
import wpParamMixins from 'wpapi/lib/mixins/parameters'
import humps from 'humps'

import { ContentTypes, ContentTypesPlural } from '../constants/ContentTypes'
import getWP from '../wpapi'
import invariants from './invariants'

const contentTypes = {}

export default contentTypes

function hasKeys (obj, ...keys) {
  return keys.reduce((bool, key) => {
    if (!bool) return bool
    return obj.hasOwnProperty(key)
  }, true)
}

// Pre-populate cache with built-in content type options
const optionsCache = Object.keys(ContentTypes).reduce((cache, key) => {
  const name = ContentTypes[key]
  const plural = ContentTypesPlural[name]
  const slug = ContentTypesPlural[name]
  cache.set(name, { name, plural, slug })
  return cache
}, new Map())

/**
 * Create and set the options object for a content type in the cache
 * and register the method on the wpapi instance.
 * @param {Object} contentType Content type options object
 * @returns {Object}
 */
contentTypes.register = function contentTypesRegister (contentType) {
  invariants.isValidContentTypeObject(contentType)
  invariants.isNewContentType(contentTypes.getAll(), contentType)

  const {
    namespace = 'wp/v2',
    name, plural, slug, route: _route, methodName: _methodName
  } = contentType

  const WP = getWP()
  const route = _route || `/${slug}/(?P<id>)`
  const methodName = humps.camelize(_methodName || plural)
  const mixins = Object.assign({}, wpFilterMixins, wpParamMixins)
  const options = Object.assign({}, contentType, { route, methodName })

  WP[methodName] = WP.registerRoute(namespace, route, { mixins })
  optionsCache.set(name, options)
}

/**
 * Get the options for a content type.
 * @param {String} contentType The name of the content type
 * @returns {Object}
 */
contentTypes.get = function contentTypesGet (contentType) {
  return optionsCache.get(contentType)
}

/**
 * Get all registered content types and their options.
 * @returns {Object}
 */
contentTypes.getAll = function contentTypesGetAll () {
  return optionsCache
}

/**
 * Derive the content type of an entity from the WP-API.
 * @param {Object} entity Content entity
 * @returns {String|null} The content type name or null if unidentifiable
 */
contentTypes.derive = function contentTypesDerive (entity) {
  if (typeof entity.type !== 'undefined') {
    switch (entity.type) {
      case 'attachment': return ContentTypes.Media
      case 'comment': return ContentTypes.Comment
      case 'page': return ContentTypes.Page
      case 'post': return ContentTypes.Post
      default: return entity.type // Custom content type
    }
  }

  if (typeof entity.taxonomy !== 'undefined') {
    if (entity.taxonomy === 'post_tag') return ContentTypes.Tag
    if (entity.taxonomy === 'category') return ContentTypes.Category
  }

  if (entity.avatar_urls) return ContentTypes.User
  if (Array.isArray(entity.types)) return ContentTypes.Taxonomy
  if (hasKeys(entity, 'public', 'queryable', 'slug')) return ContentTypes.PostStatus
  if (hasKeys(entity, 'description', 'hierarchical', 'name')) return ContentTypes.PostType

  return null
}
