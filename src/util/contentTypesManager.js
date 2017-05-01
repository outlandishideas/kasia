import wpFilterMixins from 'wpapi/lib/mixins/filters'
import wpParamMixins from 'wpapi/lib/mixins/parameters'
import humps from 'humps'

import getWP from '../wpapi'
import invariants from '../invariants'
import { WpApiNamespace, ContentTypes, ContentTypesPlural } from '../constants'

/** Assert that an object has all `keys`. */
function hasKeys (obj, ...keys) {
  return keys.reduce((bool, key) => {
    if (!bool) return bool
    return obj.hasOwnProperty(key)
  }, true)
}

const optionsCache = new Map()

const contentTypes = { register, get, getAll, derive }

export default contentTypes

// Pre-populate cache with built-in content type options.
Object.keys(ContentTypes).forEach((key) => {
  const name = ContentTypes[key]
  const plural = ContentTypesPlural[name]
  const slug = ContentTypesPlural[name]
  contentTypes.register({ name, plural, slug }, true)
})

/** Create and set options object for a type in the cache and register on wpapi instance. */
function register (contentType, builtIn) {
  invariants.isValidContentTypeObject(contentType)
  invariants.isNewContentType(contentTypes.getAll(), contentType)

  const {
    namespace = WpApiNamespace,
    name, plural, slug,
    route: _route,
    methodName: _methodName
  } = contentType

  const route = _route || `/${slug}/(?P<id>)`
  const methodName = humps.camelize(_methodName || plural)
  const mixins = Object.assign({}, wpFilterMixins, wpParamMixins)
  const options = Object.assign({}, contentType, { route, methodName })

  // Only register custom types with node-wpapi instance as built-ins are already available
  if (!builtIn) {
    const WP = getWP()
    WP[methodName] = WP.registerRoute(namespace, route, { mixins })
  }

  optionsCache.set(name, options)
}

/** Get the options for a content type. */
function get (contentType) {
  return optionsCache.get(contentType)
}

/** Get all registered content types and their options. */
function getAll () {
  return optionsCache
}

/** Derive the content type of an entity from the WP-API. */
function derive (entity) {
  if (!entity) {
    throw new Error(`Expecting entity to be an object, got "${typeof entity}".`)
  }

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
    return ContentTypes.Taxonomy
  }

  if (entity.avatar_urls) return ContentTypes.User
  if (Array.isArray(entity.types)) return ContentTypes.Taxonomy
  if (hasKeys(entity, 'public', 'queryable', 'slug')) return ContentTypes.PostStatus
  if (hasKeys(entity, 'description', 'hierarchical', 'name')) return ContentTypes.PostType

  return null
}
