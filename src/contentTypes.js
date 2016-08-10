import mixins from 'wpapi/lib/mixins/index'
import { camelize } from 'humps'

import invariants from './invariants'

/**
 * The built-in content types available in WordPress.
 * @type {Object}
 */
export const ContentTypes = {
  Category: 'category',
  Comment: 'comment',
  Media: 'media',
  Page: 'page',
  Post: 'post',
  PostStatus: 'status',
  PostType: 'type',
  PostRevision: 'revision',
  Tag: 'tag',
  Taxonomy: 'taxonomy',
  User: 'user'
}

/**
 * Plural names of the built-in content types. These are used in determining the
 * node-wpapi method to call when fetching a content type's respective data.
 * @type {Object}
 */
export const ContentTypesPlural = {
  [ContentTypes.Category]: 'categories',
  [ContentTypes.Comment]: 'comments',
  [ContentTypes.Media]: 'media',
  [ContentTypes.Page]: 'pages',
  [ContentTypes.Post]: 'posts',
  [ContentTypes.PostStatus]: 'statuses',
  [ContentTypes.PostType]: 'types',
  [ContentTypes.PostRevision]: 'revisions',
  [ContentTypes.Tag]: 'tags',
  [ContentTypes.Taxonomy]: 'taxonomies',
  [ContentTypes.User]: 'users'
}

/**
 * These content types do not have `id` properties.
 * @type {Array}
 */
export const ContentTypesWithoutId = [
  ContentTypesPlural[ContentTypes.Category],
  ContentTypesPlural[ContentTypes.PostType],
  ContentTypesPlural[ContentTypes.PostStatus],
  ContentTypesPlural[ContentTypes.Taxonomy]
]

// Create the options object for a built-in content type
const makeBuiltInContentTypeOptions = (name) => ({
  name,
  plural: ContentTypesPlural[name],
  slug: ContentTypesPlural[name]
})

// Pre-populate cache with built-in content type options
const optionsCache = Object.keys(ContentTypes).reduce((cache, key) => {
  const name = ContentTypes[key]
  cache[name] = makeBuiltInContentTypeOptions(name)
  return cache
}, {})

/**
 * Create and set the options object for a content type in the cache
 * and create the method on an instance of wpapi.
 * @param {Object} WP Instance of wpapi
 * @param {Object} contentType Content type options object
 * @returns {Object}
 */
export function registerContentType (WP, contentType) {
  invariants.isValidContentTypeObject(contentType)
  invariants.isNewContentType(getContentTypes(), contentType)

  const {
    namespace = 'wp/v2',
    name, methodName, plural, route, slug
  } = contentType

  const realRoute = route || `/${slug}/(?P<id>)`
  const realMethodName = camelize(methodName || plural)

  optionsCache[name] = contentType
  WP[realMethodName] = WP.registerRoute(namespace, realRoute, { mixins })
}

/**
 * Get the options for a content type.
 * @param {String} contentType The name of the content type
 * @returns {Object}
 */
export function getContentType (contentType) {
  return optionsCache[contentType]
}

/**
 * Get all registered content types and their options.
 * @returns {Object}
 */
export function getContentTypes () {
  return optionsCache
}

/**
 * Derive the content type of an entity from the WP-API.
 * Accepts normalised (camel-case keys) or non-normalised data.
 * @param {Object} entity
 * @returns {String} The content type
 */
export function deriveContentType (entity) {
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
